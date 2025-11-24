import { CallRecord, PracticeInfo } from '@/lib/types';
import { nanoid } from 'nanoid';

// In-memory storage (replace with Supabase in production)
const callRecords = new Map<string, CallRecord>();

export class StorageService {
  /**
   * Create a new call record
   */
  static async createCallRecord(practiceInfo: PracticeInfo): Promise<CallRecord> {
    const callId = nanoid(16);
    const now = new Date();

    const record: CallRecord = {
      id: callId,
      practiceInfo,
      status: 'initiating',
      createdAt: now,
      updatedAt: now,
    };

    callRecords.set(callId, record);
    return record;
  }

  /**
   * Get a call record by ID
   */
  static async getCallRecord(callId: string): Promise<CallRecord | null> {
    return callRecords.get(callId) || null;
  }

  /**
   * Update a call record
   */
  static async updateCallRecord(
    callId: string,
    updates: Partial<CallRecord>
  ): Promise<CallRecord | null> {
    const record = callRecords.get(callId);
    if (!record) return null;

    const updated = {
      ...record,
      ...updates,
      updatedAt: new Date(),
    };

    callRecords.set(callId, updated);
    return updated;
  }

  /**
   * Get all call records (for history)
   */
  static async getAllCallRecords(): Promise<CallRecord[]> {
    return Array.from(callRecords.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Delete a call record
   */
  static async deleteCallRecord(callId: string): Promise<boolean> {
    return callRecords.delete(callId);
  }
}

// For production, implement Supabase version:
/*
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class StorageService {
  static async createCallRecord(practiceInfo: PracticeInfo): Promise<CallRecord> {
    const { data, error } = await supabase
      .from('call_records')
      .insert({
        practice_info: practiceInfo,
        status: 'initiating',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getCallRecord(callId: string): Promise<CallRecord | null> {
    const { data, error } = await supabase
      .from('call_records')
      .select('*')
      .eq('id', callId)
      .single();

    if (error) return null;
    return data;
  }

  static async updateCallRecord(
    callId: string,
    updates: Partial<CallRecord>
  ): Promise<CallRecord | null> {
    const { data, error } = await supabase
      .from('call_records')
      .update(updates)
      .eq('id', callId)
      .select()
      .single();

    if (error) return null;
    return data;
  }

  static async getAllCallRecords(): Promise<CallRecord[]> {
    const { data, error } = await supabase
      .from('call_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return [];
    return data;
  }

  static async deleteCallRecord(callId: string): Promise<boolean> {
    const { error } = await supabase
      .from('call_records')
      .delete()
      .eq('id', callId);

    return !error;
  }
}
*/
