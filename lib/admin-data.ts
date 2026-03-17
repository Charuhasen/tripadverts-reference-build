// ── Types ──

export type DriverStatus = "active" | "offline";
export type PayoutStatus = "pending" | "paid" | "failed";
export type RecipientType = "driver" | "fleet";

export interface Fleet {
  id: string;
  name: string;
  owner: string;
  phone: string;
  city: string;
  driverCount: number;
  activeCount: number;
  pendingPayout: number;
  lastPayout: { amount: number; date: string };
  joinedAt: string;
}

export interface FleetDriver {
  id: string;
  fleetId: string;
  fleetName: string;
  name: string;
  plate: string;
  status: DriverStatus;
  lat: number;
  lng: number;
  zone: string;
  tabletOnline: boolean;
  lastSeen: string;
}

export interface IndividualDriver {
  id: string;
  name: string;
  phone: string;
  plate: string;
  vehicle: string;
  zone: string;
  status: DriverStatus;
  lat: number;
  lng: number;
  tabletOnline: boolean;
  pendingPayout: number;
  lastPayout: { amount: number; date: string };
  joinedAt: string;
  lastSeen: string;
}

export interface PayoutRecord {
  id: string;
  recipientId: string;
  recipientName: string;
  type: RecipientType;
  amount: number;
  status: PayoutStatus;
  date: string;
  period: string;
}

// ── Network ──

export const NETWORK_TOTAL_TAXIS = 380;
export const NETWORK_BOOKED = 247;

// ── Demo Data ──

export const DEMO_FLEETS: Fleet[] = [
  { id: "f1", name: "Accra Cabs Network",  owner: "Emmanuel Boateng", phone: "024 700 1122", city: "Accra", driverCount: 12, activeCount: 9,  pendingPayout: 1840, lastPayout: { amount: 2100, date: "2026-03-01" }, joinedAt: "2024-08-12" },
  { id: "f2", name: "KAS Transport Ltd",   owner: "Kwesi Asante",     phone: "020 333 4455", city: "Accra", driverCount: 8,  activeCount: 5,  pendingPayout: 970,  lastPayout: { amount: 1350, date: "2026-03-01" }, joinedAt: "2024-09-05" },
  { id: "f3", name: "Tema Express",        owner: "Abena Mensah",     phone: "050 211 9988", city: "Accra", driverCount: 6,  activeCount: 6,  pendingPayout: 620,  lastPayout: { amount: 840,  date: "2026-03-01" }, joinedAt: "2025-01-20" },
  { id: "f4", name: "Legon Riders",        owner: "Kofi Darko",       phone: "026 544 7700", city: "Accra", driverCount: 5,  activeCount: 2,  pendingPayout: 310,  lastPayout: { amount: 560,  date: "2026-03-01" }, joinedAt: "2025-03-01" },
];

export const FLEET_DRIVERS: FleetDriver[] = [
  { id: "fd1",  fleetId: "f1", fleetName: "Accra Cabs Network", name: "Ama Owusu",      plate: "GT 4421-24", status: "active",  lat: 5.648,  lng: -0.172, zone: "East Legon",  tabletOnline: true,  lastSeen: "2026-03-16T09:14:00" },
  { id: "fd2",  fleetId: "f1", fleetName: "Accra Cabs Network", name: "Nana Agyei",     plate: "GT 2234-23", status: "active",  lat: 5.632,  lng: -0.191, zone: "Airport City", tabletOnline: true,  lastSeen: "2026-03-16T09:11:00" },
  { id: "fd3",  fleetId: "f1", fleetName: "Accra Cabs Network", name: "Bright Yeboah",  plate: "GT 8870-22", status: "active",  lat: 5.556,  lng: -0.197, zone: "Osu",          tabletOnline: false, lastSeen: "2026-03-16T07:03:00" },
  { id: "fd4",  fleetId: "f1", fleetName: "Accra Cabs Network", name: "Sarah Asare",    plate: "GT 1109-24", status: "offline", lat: 5.623,  lng: -0.218, zone: "Spintex",      tabletOnline: false, lastSeen: "2026-03-15T22:40:00" },
  { id: "fd5",  fleetId: "f2", fleetName: "KAS Transport Ltd",  name: "Joseph Kumi",    plate: "AS 5543-23", status: "active",  lat: 5.608,  lng: -0.205, zone: "Spintex",      tabletOnline: true,  lastSeen: "2026-03-16T09:10:00" },
  { id: "fd6",  fleetId: "f2", fleetName: "KAS Transport Ltd",  name: "Martha Osei",    plate: "AS 3321-24", status: "active",  lat: 5.575,  lng: -0.187, zone: "Cantonments",  tabletOnline: true,  lastSeen: "2026-03-16T09:12:00" },
  { id: "fd7",  fleetId: "f2", fleetName: "KAS Transport Ltd",  name: "Prince Darko",   plate: "AS 7788-22", status: "offline", lat: 5.591,  lng: -0.241, zone: "Dansoman",     tabletOnline: false, lastSeen: "2026-03-16T06:55:00" },
  { id: "fd8",  fleetId: "f3", fleetName: "Tema Express",       name: "Linda Badu",     plate: "GT 6632-25", status: "active",  lat: 5.668,  lng: -0.013, zone: "Tema",         tabletOnline: true,  lastSeen: "2026-03-16T09:08:00" },
  { id: "fd9",  fleetId: "f3", fleetName: "Tema Express",       name: "Charles Tetteh", plate: "GT 9901-24", status: "active",  lat: 5.679,  lng: -0.026, zone: "Tema",         tabletOnline: true,  lastSeen: "2026-03-16T09:13:00" },
  { id: "fd10", fleetId: "f3", fleetName: "Tema Express",       name: "Akosua Poku",    plate: "GT 7743-23", status: "active",  lat: 5.662,  lng:  0.002, zone: "Tema",         tabletOnline: true,  lastSeen: "2026-03-16T09:09:00" },
  { id: "fd11", fleetId: "f4", fleetName: "Legon Riders",       name: "Isaac Mensah",   plate: "GT 2210-24", status: "active",  lat: 5.651,  lng: -0.191, zone: "Legon",        tabletOnline: true,  lastSeen: "2026-03-16T09:06:00" },
  { id: "fd12", fleetId: "f4", fleetName: "Legon Riders",       name: "Frema Asante",   plate: "GT 4432-23", status: "offline", lat: 5.643,  lng: -0.183, zone: "Legon",        tabletOnline: false, lastSeen: "2026-03-16T05:30:00" },
];

export const INDIVIDUAL_DRIVERS: IndividualDriver[] = [
  { id: "id1", name: "Kwame Asante",   phone: "024 511 2233", plate: "GT 1234-24", vehicle: "Toyota Corolla", zone: "East Legon",  status: "active",  lat: 5.636, lng: -0.157, tabletOnline: true,  pendingPayout: 240, lastPayout: { amount: 310, date: "2026-03-01" }, joinedAt: "2024-01-15", lastSeen: "2026-03-16T09:15:00" },
  { id: "id2", name: "Abena Owusu",    phone: "050 999 8877", plate: "GW 5678-23", vehicle: "Hyundai Accent", zone: "Madina",      status: "active",  lat: 5.666, lng: -0.213, tabletOnline: true,  pendingPayout: 185, lastPayout: { amount: 220, date: "2026-03-01" }, joinedAt: "2024-02-20", lastSeen: "2026-03-16T09:10:00" },
  { id: "id3", name: "Kofi Mensah",    phone: "026 122 3344", plate: "GT 9012-24", vehicle: "Kia Rio",        zone: "Circle",      status: "offline", lat: 5.570, lng: -0.214, tabletOnline: false, pendingPayout: 95,  lastPayout: { amount: 180, date: "2026-03-01" }, joinedAt: "2024-03-10", lastSeen: "2026-03-16T04:22:00" },
  { id: "id4", name: "Efua Darko",     phone: "024 777 5566", plate: "GT 3456-22", vehicle: "Toyota Yaris",  zone: "Achimota",    status: "active",  lat: 5.608, lng: -0.241, tabletOnline: true,  pendingPayout: 320, lastPayout: { amount: 290, date: "2026-03-01" }, joinedAt: "2024-04-05", lastSeen: "2026-03-16T09:07:00" },
  { id: "id5", name: "Yaw Boateng",    phone: "020 566 9900", plate: "GN 8765-23", vehicle: "Nissan Sentra", zone: "Osu",         status: "active",  lat: 5.551, lng: -0.185, tabletOnline: false, pendingPayout: 150, lastPayout: { amount: 210, date: "2026-03-01" }, joinedAt: "2024-05-18", lastSeen: "2026-03-16T08:50:00" },
  { id: "id6", name: "Akua Asante",    phone: "026 344 1122", plate: "GT 2109-24", vehicle: "Honda Civic",   zone: "Legon",       status: "offline", lat: 5.649, lng: -0.199, tabletOnline: false, pendingPayout: 60,  lastPayout: { amount: 150, date: "2026-03-01" }, joinedAt: "2024-06-01", lastSeen: "2026-03-16T06:10:00" },
  { id: "id7", name: "Nii Teye",       phone: "050 891 2233", plate: "GT 5544-23", vehicle: "Suzuki Swift",  zone: "Dansoman",    status: "active",  lat: 5.584, lng: -0.256, tabletOnline: true,  pendingPayout: 275, lastPayout: { amount: 330, date: "2026-03-01" }, joinedAt: "2024-07-14", lastSeen: "2026-03-16T09:02:00" },
  { id: "id8", name: "Adwoa Frimpong", phone: "024 233 4455", plate: "GT 7897-24", vehicle: "Toyota Vitz",   zone: "Cantonments", status: "active",  lat: 5.567, lng: -0.178, tabletOnline: true,  pendingPayout: 195, lastPayout: { amount: 260, date: "2026-03-01" }, joinedAt: "2024-08-30", lastSeen: "2026-03-16T09:11:00" },
];

export const PAYOUT_RECORDS: PayoutRecord[] = [
  // Pending — current period Mar 1–15
  { id: "p1",  recipientId: "id1", recipientName: "Kwame Asante",       type: "driver", amount: 240,  status: "pending", date: "2026-03-16", period: "Mar 1–15, 2026" },
  { id: "p2",  recipientId: "f1",  recipientName: "Accra Cabs Network", type: "fleet",  amount: 1840, status: "pending", date: "2026-03-16", period: "Mar 1–15, 2026" },
  { id: "p3",  recipientId: "id2", recipientName: "Abena Owusu",        type: "driver", amount: 185,  status: "pending", date: "2026-03-16", period: "Mar 1–15, 2026" },
  { id: "p4",  recipientId: "f2",  recipientName: "KAS Transport Ltd",  type: "fleet",  amount: 970,  status: "pending", date: "2026-03-16", period: "Mar 1–15, 2026" },
  { id: "p5",  recipientId: "id4", recipientName: "Efua Darko",         type: "driver", amount: 320,  status: "pending", date: "2026-03-16", period: "Mar 1–15, 2026" },
  { id: "p6",  recipientId: "f3",  recipientName: "Tema Express",       type: "fleet",  amount: 620,  status: "pending", date: "2026-03-16", period: "Mar 1–15, 2026" },
  { id: "p7",  recipientId: "f4",  recipientName: "Legon Riders",       type: "fleet",  amount: 310,  status: "pending", date: "2026-03-16", period: "Mar 1–15, 2026" },
  { id: "p8",  recipientId: "id7", recipientName: "Nii Teye",           type: "driver", amount: 275,  status: "pending", date: "2026-03-16", period: "Mar 1–15, 2026" },
  // Failed
  { id: "p9",  recipientId: "id6", recipientName: "Akua Asante",        type: "driver", amount: 60,   status: "failed",  date: "2026-03-16", period: "Mar 1–15, 2026" },
  // Paid — previous period Feb 15–28
  { id: "p10", recipientId: "id1", recipientName: "Kwame Asante",       type: "driver", amount: 310,  status: "paid",    date: "2026-03-01", period: "Feb 15–28, 2026" },
  { id: "p11", recipientId: "f1",  recipientName: "Accra Cabs Network", type: "fleet",  amount: 2100, status: "paid",    date: "2026-03-01", period: "Feb 15–28, 2026" },
  { id: "p12", recipientId: "f2",  recipientName: "KAS Transport Ltd",  type: "fleet",  amount: 1350, status: "paid",    date: "2026-03-01", period: "Feb 15–28, 2026" },
  { id: "p13", recipientId: "id7", recipientName: "Nii Teye",           type: "driver", amount: 330,  status: "paid",    date: "2026-03-01", period: "Feb 15–28, 2026" },
  { id: "p14", recipientId: "id3", recipientName: "Kofi Mensah",        type: "driver", amount: 180,  status: "paid",    date: "2026-03-01", period: "Feb 15–28, 2026" },
  { id: "p15", recipientId: "f3",  recipientName: "Tema Express",       type: "fleet",  amount: 840,  status: "paid",    date: "2026-03-01", period: "Feb 15–28, 2026" },
  { id: "p16", recipientId: "id4", recipientName: "Efua Darko",         type: "driver", amount: 290,  status: "paid",    date: "2026-03-01", period: "Feb 15–28, 2026" },
];

// ── Derived stats ──

export function getAdminStats() {
  const totalDrivers = FLEET_DRIVERS.length + INDIVIDUAL_DRIVERS.length;
  const activeNow =
    FLEET_DRIVERS.filter((d) => d.status === "active").length +
    INDIVIDUAL_DRIVERS.filter((d) => d.status === "active").length;
  const tabletsOnline =
    FLEET_DRIVERS.filter((d) => d.tabletOnline).length +
    INDIVIDUAL_DRIVERS.filter((d) => d.tabletOnline).length;
  const pendingPayouts = PAYOUT_RECORDS.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  const networkPressure = Math.round((NETWORK_BOOKED / NETWORK_TOTAL_TAXIS) * 100);

  return { totalDrivers, activeNow, tabletsOnline, tabletsTotal: totalDrivers, pendingPayouts, networkPressure };
}
