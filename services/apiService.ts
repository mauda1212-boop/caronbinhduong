import { supabase } from './supabaseClient';

// --- API Service Implementation using Supabase ---

// Truy vấn lấy toàn bộ dữ liệu (tương thích ngược)
export const fetchAllData = async () => {
    const [jobs, users, bays, vehicles] = await Promise.all([
        supabase.from('jobs').select('*'),
        supabase.from('users').select('*'),
        supabase.from('bays').select('*'),
        supabase.from('vehicles').select('*')
    ]);

    if (jobs.error) throw jobs.error;
    if (users.error) throw users.error;
    if (bays.error) throw bays.error;
    if (vehicles.error) throw vehicles.error;

    return {
        jobs: jobs.data,
        users: users.data,
        bays: bays.data,
        vehicles: vehicles.data
    };
};

// Truy vấn nhanh (Jobs, Users, Bays)
export const fetchFastData = async () => {
    const [jobs, users, bays] = await Promise.all([
        supabase.from('jobs').select('*'),
        supabase.from('users').select('*'),
        supabase.from('bays').select('*')
    ]);

    if (jobs.error) throw jobs.error;
    if (users.error) throw users.error;
    if (bays.error) throw bays.error;

    return {
        jobs: jobs.data,
        users: users.data,
        bays: bays.data
    };
};

// Truy vấn xe (Vehicles)
export const fetchVehicles = async () => {
    const { data, error } = await supabase.from('vehicles').select('*');
    if (error) throw error;
    return data;
};

// --- Job API ---

const cleanObject = (obj: any) => {
    const newObj: any = {};
    Object.keys(obj).forEach(key => {
        if (obj[key] !== undefined) {
            newObj[key] = obj[key];
        }
    });
    return newObj;
};

export const addJob = async (job: any) => {
    const cleanJob = cleanObject(job);
    const { data, error } = await supabase.from('jobs').insert(cleanJob).select();
    if (error) throw error;
    if (!data || data.length === 0) throw new Error("Không thể thêm công việc vào CSDL");
    return data[0];
};

export const updateJob = async (job: any) => {
    const cleanJob = cleanObject(job);
    const { data, error } = await supabase.from('jobs').update(cleanJob).eq('id', job.id).select();
    if (error) throw error;
    if (!data || data.length === 0) throw new Error("Không thể cập nhật công việc trong CSDL");
    return data[0];
};

export const deleteJob = async (jobId: string) => {
    const { error } = await supabase.from('jobs').delete().eq('id', jobId);
    if (error) throw error;
    return { success: true };
};

// --- User API ---

export const addUser = async (user: any) => {
    const cleanUser = cleanObject(user);
    const { data, error } = await supabase.from('users').insert(cleanUser).select();
    if (error) throw error;
    if (!data || data.length === 0) throw new Error("Không thể thêm người dùng");
    return data[0];
};

export const updateUser = async (user: any) => {
    const cleanUser = cleanObject(user);
    const { data, error } = await supabase.from('users').update(cleanUser).eq('id', user.id).select();
    if (error) throw error;
    if (!data || data.length === 0) throw new Error("Không thể cập nhật người dùng");
    return data[0];
};

export const deleteUser = async (userId: string) => {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;
    return { success: true };
};

// --- Bay API ---

export const addBay = async (bay: any) => {
    const cleanBay = cleanObject(bay);
    const { data, error } = await supabase.from('bays').insert(cleanBay).select();
    if (error) throw error;
    if (!data || data.length === 0) throw new Error("Không thể thêm khoang");
    return data[0];
};

export const updateBay = async (bay: any) => {
    const cleanBay = cleanObject(bay);
    const { data, error } = await supabase.from('bays').update(cleanBay).eq('id', bay.id).select();
    if (error) throw error;
    if (!data || data.length === 0) throw new Error("Không thể cập nhật khoang");
    return data[0];
};

export const deleteBay = async (bayId: string) => {
    const { error } = await supabase.from('bays').delete().eq('id', bayId);
    if (error) throw error;
    return { success: true };
};

// --- Vehicle API ---

export const addVehicle = async (vehicle: any) => {
    const cleanVehicle = cleanObject(vehicle);
    const { data, error } = await supabase.from('vehicles').insert(cleanVehicle).select();
    if (error) throw error;
    if (!data || data.length === 0) throw new Error("Không thể thêm xe");
    return data[0];
};

export const updateVehicle = async (vehicle: any) => {
    const cleanVehicle = cleanObject(vehicle);
    const { data, error } = await supabase.from('vehicles').update(cleanVehicle).eq('id', vehicle.id).select();
    if (error) throw error;
    if (!data || data.length === 0) throw new Error("Không thể cập nhật xe");
    return data[0];
};

export const importVehicles = async (vehicles: any[]) => {
    const { data, error } = await supabase.from('vehicles').upsert(vehicles).select();
    if (error) throw error;
    return data;
};
