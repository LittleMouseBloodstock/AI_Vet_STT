from typing import Dict, List, Optional, Tuple
from schemas import Animal, Record, SoapNotes
import threading
import os
from fastapi import HTTPException

try:
    from supabase import create_client, Client
except Exception:
    create_client = None
    Client = None

_lock = threading.Lock()
DEV_MODE = (os.getenv("LOCAL_DEV", "0") == "1")


def _get_supabase_client() -> "Client":
    url = os.getenv("SUPABASE_URL")
    key = (
        os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        or os.getenv("SUPABASE_KEY")
        or os.getenv("SUPABASE_ANON_KEY")
    )
    if not url or not key:
        raise RuntimeError("SUPABASE_URL or SUPABASE_*_KEY is not set.")
    if create_client is None:
        raise RuntimeError("supabase client library is not installed.")
    return create_client(url, key)


def _use_supabase() -> bool:
    if DEV_MODE:
        return False
    return bool(os.getenv("SUPABASE_URL")) and bool(
        os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        or os.getenv("SUPABASE_KEY")
        or os.getenv("SUPABASE_ANON_KEY")
    )


def _animal_from_row(row: dict) -> Animal:
    return Animal(
        id=row.get("id"),
        microchip_number=row.get("microchip_number") or row.get("id"),
        name=row.get("name"),
        farm_id=row.get("farm_id"),
        age=row.get("age"),
        sex=row.get("sex"),
        breed=row.get("breed"),
        thumbnailUrl=row.get("thumbnail_url"),
        records=[],
    )


def _record_from_row(row: dict) -> Record:
    soap = row.get("soap") or {}
    record = Record(
        id=row.get("id"),
        animalId=row.get("animal_id"),
        visit_date=row.get("visit_date"),
        soap=SoapNotes(
            s=soap.get("s", "") if isinstance(soap, dict) else "",
            o=soap.get("o", "") if isinstance(soap, dict) else "",
            a=soap.get("a", "") if isinstance(soap, dict) else "",
            p=soap.get("p", "") if isinstance(soap, dict) else "",
        ),
        medication_history=row.get("medication_history") or [],
        next_visit_date=row.get("next_visit_date"),
        next_visit_time=row.get("next_visit_time"),
        images=row.get("images") or [],
        audioUrl=row.get("audio_url"),
        doctor=row.get("doctor"),
        nosai_points=row.get("nosai_points"),
        external_case_id=row.get("external_case_id"),
        external_ref_url=row.get("external_ref_url"),
    )
    if row.get("medications"):
        try:
            record.medications = row.get("medications")
        except Exception:
            pass
    return record


class InMemoryDB:
    def __init__(self):
        self.animals: Dict[str, Animal] = {}

    def list_animals(self, query: str = "", microchip_number: str = None, farm_id: str = None,
                     breed: str = None, sex: str = None) -> List[Animal]:
        animals = list(self.animals.values()) if not query else self.search_animals(query)

        def match(a: Animal) -> bool:
            if microchip_number and a.microchip_number != microchip_number:
                return False
            if farm_id and getattr(a, "farm_id", None) and farm_id not in a.farm_id:
                return False
            if breed and getattr(a, "breed", None) and breed != a.breed:
                return False
            if sex and getattr(a, "sex", None) and sex != a.sex:
                return False
            return True

        return [a for a in animals if match(a)]

    # Animals
    def add_animal(self, animal: Animal):
        with _lock:
            self.animals[animal.id] = animal

    def search_animals(self, query: str):
        q = (query or "").lower()
        results = [
            a for a in self.animals.values()
            if q in a.name.lower() or (getattr(a, "farm_id", None) and q in a.farm_id.lower())
        ]
        for animal in results:
            animal.records = self.get_records_for_animal(animal.id)
        return results

    def get_animal(self, animal_id: str) -> Optional[Animal]:
        return self.animals.get(animal_id)

    # Records
    def add_record(self, record: Record):
        animal = self.get_animal(record.animalId)
        if not animal:
            raise HTTPException(status_code=404, detail=f"Animal with ID {record.animalId} not found.")
        with _lock:
            if not hasattr(animal, "records"):
                animal.records = []
            animal.records.append(record)

    def find_record(self, record_id: str) -> Tuple[Optional[str], Optional[Record], int]:
        for animal_id, animal in self.animals.items():
            if hasattr(animal, "records") and animal.records:
                for idx, rec in enumerate(animal.records):
                    if getattr(rec, "id", None) == record_id:
                        return animal_id, rec, idx
        return None, None, -1

    def update_record_by_id(self, record_id: str, new_record: Record) -> Record:
        animal_id, old, idx = self.find_record(record_id)
        if not old:
            raise HTTPException(status_code=404, detail="Record not found")
        self.animals[animal_id].records[idx] = new_record
        return new_record

    def delete_record_by_id(self, record_id: str) -> bool:
        animal_id, old, idx = self.find_record(record_id)
        if not old:
            raise HTTPException(status_code=404, detail="Record not found")
        self.animals[animal_id].records.pop(idx)
        return True

    def get_records_for_animal(self, animal_id: str):
        animal = self.animals.get(animal_id)
        if animal and hasattr(animal, "records"):
            return animal.records
        return []

    def generate_summary(self, animal_id: str) -> str:
        records = self.get_records_for_animal(animal_id)
        if not records:
            return "該当する診療記録がありません"
        parts: List[str] = []
        for r in records:
            s = r.soap.s
            o = r.soap.o
            a = r.soap.a
            p = r.soap.p
            parts.append(f"{r.visit_date}: S({s}), O({o}), A({a}), P({p})")
        return "\n".join(parts)


class SupabaseDB:
    def __init__(self):
        self.client = _get_supabase_client()

    def list_animals(self, query: str = "", microchip_number: str = None, farm_id: str = None,
                     breed: str = None, sex: str = None) -> List[Animal]:
        q = self.client.table("animals").select("*")
        if query:
            q = q.or_(f"name.ilike.%{query}%,farm_id.ilike.%{query}%")
        if microchip_number:
            q = q.eq("microchip_number", microchip_number)
        if farm_id:
            q = q.ilike("farm_id", f"%{farm_id}%")
        if breed:
            q = q.eq("breed", breed)
        if sex:
            q = q.eq("sex", sex)
        resp = q.execute()
        rows = resp.data or []
        animals = [_animal_from_row(r) for r in rows]
        return animals

    def add_animal(self, animal: Animal):
        data = {
            "id": animal.id,
            "microchip_number": animal.microchip_number,
            "name": animal.name,
            "farm_id": animal.farm_id,
            "age": animal.age,
            "sex": animal.sex,
            "breed": animal.breed,
            "thumbnail_url": animal.thumbnailUrl,
        }
        self.client.table("animals").upsert(data).execute()

    def search_animals(self, query: str):
        animals = self.list_animals(query=query)
        for animal in animals:
            animal.records = self.get_records_for_animal(animal.id)
        return animals

    def get_animal(self, animal_id: str) -> Optional[Animal]:
        resp = self.client.table("animals").select("*").eq("id", animal_id).limit(1).execute()
        rows = resp.data or []
        if not rows:
            return None
        return _animal_from_row(rows[0])

    def add_record(self, record: Record):
        animal = self.get_animal(record.animalId)
        if not animal:
            raise HTTPException(status_code=404, detail=f"Animal with ID {record.animalId} not found.")
        data = {
            "id": record.id,
            "animal_id": record.animalId,
            "visit_date": record.visit_date,
            "soap": record.soap.model_dump(),
            "medication_history": record.medication_history or [],
            "next_visit_date": record.next_visit_date,
            "next_visit_time": record.next_visit_time,
            "images": record.images or [],
            "audio_url": record.audioUrl,
            "doctor": record.doctor,
            "nosai_points": record.nosai_points,
            "external_case_id": record.external_case_id,
            "external_ref_url": record.external_ref_url,
            "medications": record.medications or [],
        }
        self.client.table("records").insert(data).execute()

    def update_record_by_id(self, record_id: str, new_record: Record) -> Record:
        data = {
            "animal_id": new_record.animalId,
            "visit_date": new_record.visit_date,
            "soap": new_record.soap.model_dump(),
            "medication_history": new_record.medication_history or [],
            "next_visit_date": new_record.next_visit_date,
            "next_visit_time": new_record.next_visit_time,
            "images": new_record.images or [],
            "audio_url": new_record.audioUrl,
            "doctor": new_record.doctor,
            "nosai_points": new_record.nosai_points,
            "external_case_id": new_record.external_case_id,
            "external_ref_url": new_record.external_ref_url,
            "medications": new_record.medications or [],
        }
        resp = self.client.table("records").update(data).eq("id", record_id).execute()
        if not (resp.data or []):
            raise HTTPException(status_code=404, detail="Record not found")
        return new_record

    def delete_record_by_id(self, record_id: str) -> bool:
        resp = self.client.table("records").delete().eq("id", record_id).execute()
        if not (resp.data or []):
            raise HTTPException(status_code=404, detail="Record not found")
        return True

    def get_records_for_animal(self, animal_id: str):
        resp = self.client.table("records").select("*").eq("animal_id", animal_id).execute()
        rows = resp.data or []
        return [_record_from_row(r) for r in rows]

    def generate_summary(self, animal_id: str) -> str:
        records = self.get_records_for_animal(animal_id)
        if not records:
            return "該当する診療記録がありません"
        parts: List[str] = []
        for r in records:
            s = r.soap.s
            o = r.soap.o
            a = r.soap.a
            p = r.soap.p
            parts.append(f"{r.visit_date}: S({s}), O({o}), A({a}), P({p})")
        return "\n".join(parts)


DB = SupabaseDB() if _use_supabase() else InMemoryDB()
