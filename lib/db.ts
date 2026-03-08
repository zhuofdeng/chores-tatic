import { supabase } from './supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DbProfile = {
  id: string;
  name: string | null;
  email: string | null;
  user_type: 'parent' | 'child';
  provider: string;
  family_id: string | null;
};

export type DbFamily = {
  id: string;
  name: string;
  join_code: string;
};

// ─── SQL schema (run once in Supabase SQL editor) ────────────────────────────
//
// create table families (
//   id        uuid primary key default gen_random_uuid(),
//   name      text not null default 'My Family',
//   join_code text unique not null,
//   created_at timestamptz default now()
// );
//
// create table profiles (
//   id         text primary key,
//   name       text,
//   email      text,
//   user_type  text check (user_type in ('parent', 'child')) not null,
//   provider   text not null,
//   family_id  uuid references families(id),
//   created_at timestamptz default now(),
//   updated_at timestamptz default now()
// );

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomJoinCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ─── Profile operations ───────────────────────────────────────────────────────

/**
 * Load a parent's profile and their family from Supabase.
 * Returns null if the profile does not exist yet.
 */
export async function loadParentData(
  userId: string,
): Promise<{ profile: DbProfile; family: DbFamily | null } | null> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!profile) return null;

  if (!profile.family_id) return { profile, family: null };

  const { data: family, error: familyError } = await supabase
    .from('families')
    .select('*')
    .eq('id', profile.family_id)
    .maybeSingle();
  if (familyError) throw familyError;

  return { profile, family };
}

/**
 * Create a new profile and a new family for a first-time parent.
 */
export async function createParentWithFamily(
  userId: string,
  name: string | null,
  email: string | null,
  provider: string,
): Promise<{ profile: DbProfile; family: DbFamily }> {
  const { data: family, error: familyError } = await supabase
    .from('families')
    .insert({ join_code: randomJoinCode() })
    .select()
    .single();
  if (familyError) throw familyError;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({ id: userId, name, email, user_type: 'parent', provider, family_id: family.id })
    .select()
    .single();
  if (profileError) throw profileError;

  return { profile, family };
}

// ─── Task operations ──────────────────────────────────────────────────────────
//
// Add this table in Supabase SQL editor:
//
// create table tasks (
//   id               uuid primary key default gen_random_uuid(),
//   family_id        uuid references families(id) not null,
//   title            text not null,
//   value            integer not null default 0,
//   assigned_to_name text,
//   completed        boolean not null default false,
//   created_at       timestamptz default now()
// );
//
// -- RLS policies:
// create policy "anon can read tasks"   on tasks for select to anon using (true);
// create policy "anon can insert tasks" on tasks for insert to anon with check (true);
// create policy "anon can update tasks" on tasks for update to anon using (true) with check (true);
// create policy "anon can delete tasks" on tasks for delete to anon using (true);

export type DbTask = {
  id: string;
  family_id: string;
  title: string;
  value: number;
  assigned_to_name: string | null;
  completed: boolean;
  created_at: string;
};

export async function getTasksForFamily(familyId: string): Promise<DbTask[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createTask(
  familyId: string,
  title: string,
  value: number,
  assignedToName: string | null,
): Promise<DbTask> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ family_id: familyId, title, value, assigned_to_name: assignedToName })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) throw error;
}

// ─── Family member operations ─────────────────────────────────────────────────
//
// create table family_members (
//   id         uuid primary key default gen_random_uuid(),
//   family_id  uuid references families(id) not null,
//   child_id   text not null unique,
//   name       text not null,
//   status     text check (status in ('pending','approved','rejected')) not null default 'pending',
//   created_at timestamptz default now()
// );
//
// -- RLS policies:
// create policy "anon can read family_members"   on family_members for select to anon using (true);
// create policy "anon can insert family_members" on family_members for insert to anon with check (true);
// create policy "anon can update family_members" on family_members for update to anon using (true) with check (true);

export type DbFamilyMember = {
  id: string;
  family_id: string;
  child_id: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

export async function createMemberRequest(
  familyId: string,
  childId: string,
  name: string,
): Promise<DbFamilyMember> {
  const { data, error } = await supabase
    .from('family_members')
    .insert({ family_id: familyId, child_id: childId, name })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMemberByChildId(childId: string): Promise<DbFamilyMember | null> {
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .eq('child_id', childId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getPendingMembers(familyId: string): Promise<DbFamilyMember[]> {
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .eq('family_id', familyId)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getApprovedMembers(familyId: string): Promise<DbFamilyMember[]> {
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .eq('family_id', familyId)
    .eq('status', 'approved')
    .order('name', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function updateMemberStatus(
  memberId: string,
  status: 'approved' | 'rejected',
): Promise<void> {
  const { error } = await supabase
    .from('family_members')
    .update({ status })
    .eq('id', memberId);
  if (error) throw error;
}

export async function claimTask(taskId: string, childName: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({ assigned_to_name: childName })
    .eq('id', taskId)
    .is('assigned_to_name', null);
  if (error) throw error;
}

// ─── Family / join-code operations ────────────────────────────────────────────

/**
 * Look up a family by its join code.
 * Returns null if the code doesn't match any family.
 */
export async function getFamilyByJoinCode(joinCode: string): Promise<DbFamily | null> {
  const { data, error } = await supabase
    .from('families')
    .select('*')
    .eq('join_code', joinCode.toUpperCase().trim())
    .maybeSingle();
  if (error) throw error;
  return data;
}
