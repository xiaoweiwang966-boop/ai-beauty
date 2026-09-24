import { supabase } from './supabase';

export type ScanHistoryItem = {
  id: string;
  image_url: string | null;
  overall_score: number;
  skin_score: number;
  face_shape: string;
  face_shape_label: string;
  summary: string;
  created_at: string;
};

export async function saveScanHistory(item: {
  image_url: string;
  overall_score: number;
  skin_score: number;
  face_shape: string;
  face_shape_label: string;
  summary: string;
}): Promise<ScanHistoryItem | null> {
  const { data, error } = await supabase
    .from('scan_history')
    .insert(item)
    .select()
    .single();

  if (error) {
    console.error('Failed to save scan history:', error);
    return null;
  }

  return data as ScanHistoryItem;
}

export async function fetchScanHistory(): Promise<ScanHistoryItem[]> {
  const { data, error } = await supabase
    .from('scan_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Failed to fetch scan history:', error);
    return [];
  }

  return (data ?? []) as ScanHistoryItem[];
}

export async function deleteScanHistory(id: string): Promise<boolean> {
  const { error } = await supabase.from('scan_history').delete().eq('id', id);
  if (error) {
    console.error('Failed to delete scan history:', error);
    return false;
  }
  return true;
}
