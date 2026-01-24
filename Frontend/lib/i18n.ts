export type Lang = 'ja' | 'en';

const LANG_KEY = 'uiLang';
const LANG_EVENT = 'ui-lang-change';

export function getLang(): Lang {
  try {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(LANG_KEY) as Lang | null;
      if (saved === 'ja' || saved === 'en') return saved;
    }
  } catch { }
  if (typeof navigator !== 'undefined') {
    const l = (navigator.language || (navigator.languages && navigator.languages[0]) || '').toLowerCase();
    if (l.startsWith('en')) return 'en';
  }
  return 'ja';
}

export function setLang(lang: Lang) {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANG_KEY, lang);
      window.dispatchEvent(new CustomEvent(LANG_EVENT, { detail: { lang } }));
    }
  } catch { }
}

const dict = {
  ja: {
    back_to_search: '検索画面に戻る',
    go_home: 'ホームへ',
    schedule_title: '診療スケジュール',
    year_month: (y: number, m: number) => `${y}年 ${m}月`,
    app_title: 'AI Vet Chart',
    app_tagline: '大動物臨床向けAIカルテシステム (MVP)',
    search_placeholder: 'チップ番号、患畜名、牧場名…',
    search_button: '検索',
    schedule_button: 'スケジュール',
    browse_farms_button: '牧場一覧から探す',
    new_animal_button: '新規登録はこちら',
    sample_terms_lead: '検索例:',
    sample_term1: 'はな',
    sample_farm1: '佐藤牧場',
    farms_heading: '牧場一覧（五十音順）',
    search_again: '再検索する',
    results_count: (n: number) => `検索結果: ${n} 件`,
    no_results: (q: string) => `「${q}」に一致する動物は見つかりませんでした。`,
    add_new: '新規登録する',

    // New Record Form
    new_record_title: '新しい診療記録',
    label_voice_input: '音声入力',
    btn_stop_recognition: '認識停止',
    btn_start_recognition: 'リアルタイム認識',
    btn_stop_recording: '録音停止',
    btn_start_recording: '録音して文字起こし',
    btn_select_audio_file: '音声ファイル選択',
    status_listening: '音声認識中... 話してください',
    status_processing_audio: '音声ファイルを処理中...',
    label_selected_file: '選択されたファイル: {name}',
    btn_delete: '削除',
    err_browser_audio: 'お使いのブラウザは音声の再生をサポートしていません。',
    label_transcription: '転写テキスト',
    btn_ai_soap: 'AIでSOAP変換',
    placeholder_transcription: 'ここに音声認識結果が表示、または手動で入力します',

    // Medications
    section_medication: '投薬',
    placeholder_drug_name: '薬剤名',
    placeholder_dose: '用量(例: 5mg/kg)',
    placeholder_route: '投与ルート',
    btn_add_medication: '投薬を追加',

    // Nosai
    section_nosai: 'NOSAI（任意）',
    placeholder_points: '治療点数',

    // Images
    section_images: '診療画像（最大10枚、各5MB以下）',
    btn_stop_camera: 'カメラ停止',
    btn_start_camera: 'カメラで撮影',
    btn_select_file: 'ファイルから選択',
    camera_instruction: 'カメラを被写体に向けて、下のボタンで撮影してください',
    label_add_image: '画像を追加',

    // SOAP
    section_soap: '診療ノート',
    placeholder_soap_input: '{key}の内容を入力してください', // {key} will be replaced manually or via logic if needed

    // Schedule
    section_next_visit: '次回診療予定（オプション）',
    label_date: '予定日',
    label_time: '予定時間',
    placeholder_select_time: '時間を選択',
    status_booked: '（予約済み）',
    btn_expand_calendar: 'カレンダー拡大',
    modal_schedule_title: 'スケジュール（拡大表示）',
    view_list: '一覧',
    view_month: '月表示',
    btn_today: '今日へ',
    suffix_schedule: ' の予定',
    msg_no_appointments: 'この日に予定はありません',

    // Actions
    btn_reset: 'リセット',
    btn_saving: '保存中...',
    btn_save_record: '診療記録を保存',
    msg_save_success: '記録が正常に保存されました',

    // Errors
    err_generic: 'エラー',
    err_soap_required: '最低でも1つのSOAP項目（S/O/A/P）を入力してください。',
    err_date_time_required: '次回予約日を設定した場合、時間も選択してください。',
    err_browser_support: 'このブラウザは音声認識をサポートしていません。Chrome、Edge、Safariをお使いください。',
    err_mic_access: 'マイクへのアクセスが許可されていません。ブラウザの設定を確認してください。',
    err_no_voice: '音声が検出されませんでした。もう一度お試しください。',
    err_transcription_failed: '音声認識の開始に失敗しました。',
    err_audio_file_process: '音声ファイルの処理に失敗しました。サンプルテキストを表示しています。',
    err_max_images: '画像は最大10枚までです。',
    err_no_text: '転写テキストがありません。',
    err_camera_access: 'カメラへのアクセスが許可されていません。ブラウザの設定を確認してください。',
    err_image_prep_failed: 'カメラまたはキャンバスの準備ができていません。',
    err_canvas_failed: 'キャンバスコンテキストを取得できませんでした。',
    err_video_not_ready: 'ビデオの準備ができていません。少し待ってからもう一度お試しください。',
    err_video_size: 'ビデオサイズを取得できませんでした。',
    err_blob_failed: 'toBlob失敗',
    err_max_images_selected: '画像は最大10枚まで選択できます。',
    err_save_failed: '保存に失敗しました',
    err_auto_convert: '自動変換エラー',

    // New Animal Form
    new_animal_title: '新しい動物を登録',
    label_microchip: 'マイクロチップ番号',
    placeholder_microchip: '10桁以上の半角数字',
    label_farm_name: '牧場名',
    label_animal_name: '個体名',
    btn_register_chart: '登録してカルテ作成へ',
    err_required_all: '全ての必須項目を入力してください。',
    status_registering: '登録中...',

    // Animal Detail
    loading_data: 'データを読み込み中...',
    back_to_results: '検索結果に戻る',
    detail_microchip: 'マイクロチップ',
    detail_farm: '所属',
    no_data: 'データなし',
    medical_summary_title: '病歴概要',
    total_consultations: '総診療回数: {n}回',
    key_diagnoses: '主な診断',
    key_treatments: '主な治療方針',
    last_consultation: '最終診療',
    no_record_date: '記録なし',
    past_records_title: '過去の診療記録',
    no_records_message: 'この個体の診療記録はまだありません。',
    label_next_visit_date: '次回診療予定日',
    next_visit_label: '次回予定',
    medical_images_title: '診療画像 ({n}枚)',
    click_to_enlarge: '拡大表示',
  },
  en: {
    back_to_search: 'Back to search',
    go_home: 'Home',
    schedule_title: 'Schedule',
    year_month: (y: number, m: number) => `${m}/${y}`,
    app_title: 'AI Vet Chart',
    app_tagline: 'AI charting system for large-animal practice (MVP)',
    search_placeholder: 'Microchip number, animal name, or farm…',
    search_button: 'Search',
    schedule_button: 'View schedule',
    browse_farms_button: 'Browse farms',
    new_animal_button: 'Add a new animal',
    sample_terms_lead: 'Examples:',
    sample_term1: 'Hana',
    sample_farm1: 'Sato Farm',
    farms_heading: 'Farms (A–Z)',
    search_again: 'Back to search',
    results_count: (n: number) => `Results: ${n}`,
    no_results: (q: string) => `No animals found for “${q}”.`,
    add_new: 'Add a new animal',

    // New Record Form
    new_record_title: 'New Medical Record',
    label_voice_input: 'Voice Input',
    btn_stop_recognition: 'Stop Recognition',
    btn_start_recognition: 'Start Recognition',
    btn_stop_recording: 'Stop Recording',
    btn_start_recording: 'Record & Transcribe',
    btn_select_audio_file: 'Select Audio File',
    status_listening: 'Listening... Please speak',
    status_processing_audio: 'Processing audio file...',
    label_selected_file: 'Selected file: {name}',
    btn_delete: 'Delete',
    err_browser_audio: 'Your browser does not support audio playback.',
    label_transcription: 'Transcription',
    btn_ai_soap: 'Convert to SOAP with AI',
    placeholder_transcription: 'Transcription results will appear here, or enter manually',

    // Medications
    section_medication: 'Medication',
    placeholder_drug_name: 'Drug Name',
    placeholder_dose: 'Dose (e.g. 5mg/kg)',
    placeholder_route: 'Route',
    btn_add_medication: 'Add Medication',

    // Nosai
    section_nosai: 'NOSAI (Optional)',
    placeholder_points: 'Treatment Points',

    // Images
    section_images: 'Medical Images (Max 10, <5MB each)',
    btn_stop_camera: 'Stop Camera',
    btn_start_camera: 'Take Photo',
    btn_select_file: 'Select from File',
    camera_instruction: 'Point camera at subject and click button below',
    label_add_image: 'Add Image',

    // SOAP
    section_soap: 'Medical Notes',
    placeholder_soap_input: 'Enter {key} content...',

    // Schedule
    section_next_visit: 'Next Appointment (Optional)',
    label_date: 'Date',
    label_time: 'Time',
    placeholder_select_time: 'Select Time',
    status_booked: '(Booked)',
    btn_expand_calendar: 'Expand Calendar',
    modal_schedule_title: 'Schedule (Expanded)',
    view_list: 'List',
    view_month: 'Month',
    btn_today: 'Today',
    suffix_schedule: "'s Schedule",
    msg_no_appointments: 'No appointments for this day',

    // Actions
    btn_reset: 'Reset',
    btn_saving: 'Saving...',
    btn_save_record: 'Save Record',
    msg_save_success: 'Record saved successfully',

    // Errors
    err_generic: 'Error',
    err_soap_required: 'Please enter at least one SOAP item (S/O/A/P).',
    err_date_time_required: 'If next visit date is set, please select time.',
    err_browser_support: 'Browser not supported.',
    err_mic_access: 'Microphone access denied. Please check browser settings.',
    err_no_voice: 'No voice detected. Please try again.',
    err_transcription_failed: 'Transcription failed.',
    err_audio_file_process: 'Audio file processing failed. Showing sample text.',
    err_max_images: 'Max 10 images allowed.',
    err_no_text: 'No transcription text.',
    err_camera_access: 'Camera access denied. Please check browser settings.',
    err_image_prep_failed: 'Camera or canvas not ready.',
    err_canvas_failed: 'Failed to seek canvas context.',
    err_video_not_ready: 'Video not ready. Please wait a moment.',
    err_video_size: 'Failed to get video dimensions.',
    err_blob_failed: 'Failed to create blob.',
    err_max_images_selected: 'You can select up to 10 images.',
    err_save_failed: 'Failed to save',
    err_auto_convert: 'Auto-conversion error',

    // New Animal Form
    new_animal_title: 'Register New Animal',
    label_microchip: 'Microchip Number',
    placeholder_microchip: '10+ digits',
    label_farm_name: 'Farm Name',
    label_animal_name: 'Animal Name',
    btn_register_chart: 'Register & Create Chart',
    err_required_all: 'Please fill in all required fields.',
    status_registering: 'Registering...',

    // Animal Detail
    loading_data: 'Loading data...',
    back_to_results: 'Back to results',
    detail_microchip: 'Microchip',
    detail_farm: 'Farm',
    no_data: 'No Data',
    medical_summary_title: 'Medical Summary',
    total_consultations: 'Total Visits: {n}',
    key_diagnoses: 'Key Diagnoses',
    key_treatments: 'Key Treatments',
    last_consultation: 'Last Visit',
    no_record_date: 'No Date',
    past_records_title: 'Past Medical Records',
    no_records_message: 'No medical records found for this animal.',
    label_next_visit_date: 'Next Visit Date',
    next_visit_label: 'Next Visit',
    medical_images_title: 'Medical Images ({n})',
    click_to_enlarge: 'Enlarge',
  },
} as const;

export function t(key: keyof typeof dict['ja']): string {
  const lang = getLang();
  const v = (dict as any)[lang][key];
  return typeof v === 'function' ? '' : v ?? key;
}

export function formatYearMonthFor(lang: Lang, y: number, m: number): string {
  const f = (dict as any)[lang].year_month;
  return typeof f === 'function' ? f(y, m) : `${y}-${m}`;
}

export function formatYearMonth(y: number, m: number): string {
  return formatYearMonthFor(getLang(), y, m);
}

export function WEEKDAYS_I18N(lang: Lang): string[] {
  return lang === 'en' ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : ['日', '月', '火', '水', '木', '金', '土'];
}

export function WEEKDAYS_FULL_I18N(lang: Lang): string[] {
  return lang === 'en'
    ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    : ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
}

// Simple i18n hook for reactive updates
import { useEffect, useState } from 'react';
export function useI18n() {
  const [lang, setLangState] = useState<Lang>(getLang());
  useEffect(() => {
    const handler = (e: any) => {
      setLangState((e?.detail?.lang as Lang) || getLang());
    };
    if (typeof window !== 'undefined') {
      window.addEventListener(LANG_EVENT, handler);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(LANG_EVENT, handler);
      }
    };
  }, []);
  return {
    lang,
    setLang,
    t: (key: keyof typeof dict['ja']) => {
      const v = (dict as any)[lang][key];
      return typeof v === 'function' ? '' : v ?? (key as string);
    },
    formatYearMonth: (y: number, m: number) => formatYearMonthFor(lang, y, m),
    WEEKDAYS: WEEKDAYS_I18N(lang),
    WEEKDAYS_FULL: WEEKDAYS_FULL_I18N(lang),
  } as const;
}
