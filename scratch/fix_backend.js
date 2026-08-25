const fs = require('fs');

const driverRepoContent = `import { query } from '../config/db';

export class DriverRepository {
  static async findByEmailOrPhone(identifier: string) {
    const res = await query(
      \`SELECT 
         d.id AS driver_id, 
         d.full_name AS name, 
         u.email, 
         u.password_hash, 
         d.phone, 
         d.nic_number, 
         d.license_number, 
         d.license_class, 
         d.license_expiry, 
         a.vehicle_id AS assigned_vehicle_id, 
         d.created_at,
         v.registration_number, 
         v.model, 
         v.total_seats AS seating_capacity
       FROM core.drivers d
       JOIN core.user_accounts u ON d.phone = u.phone
       LEFT JOIN core.driver_assignments a ON d.id = a.driver_id AND a.is_current = true
       LEFT JOIN core.vehicles v ON a.vehicle_id = v.id
       WHERE u.email = $1 OR d.phone = $1 OR d.nic_number = $1\`,
      [identifier]
    );
    return res.rows[0] || null;
  }

  static async findById(driverId: string) {
    const res = await query(
      \`SELECT 
         d.id AS driver_id, 
         d.full_name AS name, 
         u.email, 
         u.password_hash, 
         d.phone, 
         d.nic_number, 
         d.license_number, 
         d.license_class, 
         d.license_expiry, 
         a.vehicle_id AS assigned_vehicle_id, 
         d.created_at,
         v.registration_number, 
         v.model, 
         v.total_seats AS seating_capacity
       FROM core.drivers d
       JOIN core.user_accounts u ON d.phone = u.phone
       LEFT JOIN core.driver_assignments a ON d.id = a.driver_id AND a.is_current = true
       LEFT JOIN core.vehicles v ON a.vehicle_id = v.id
       WHERE d.id = $1\`,
      [driverId]
    );
    return res.rows[0] || null;
  }

  static async createDriver(data: {
    name: string;
    email: string;
    password_hash: string;
    nic_number: string;
    license_number: string;
    license_class?: string;
    phone: string;
    license_expiry: string;
    assigned_vehicle_id?: string;
  }) {
    const driverRes = await query(
      \`INSERT INTO core.drivers (id, nic_number, full_name, license_number, license_class, phone, license_expiry)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
       RETURNING id, full_name, nic_number, license_number, license_class, phone, license_expiry\`,
      [
        data.nic_number,
        data.name,
        data.license_number,
        data.license_class || 'Heavy Vehicle (Class A/B)',
        data.phone,
        data.license_expiry
      ]
    );

    const driver = driverRes.rows[0];

    await query(
      \`INSERT INTO core.user_accounts (id, email, phone, password_hash, user_type, driver_id)
       VALUES (gen_random_uuid(), $1, $2, $3, 'DRIVER', $4)\`,
      [data.email, data.phone, data.password_hash, driver.id]
    );

    if (data.assigned_vehicle_id) {
      await query(
        \`INSERT INTO core.driver_assignments (driver_id, vehicle_id, assigned_from, is_current)
         VALUES ($1, $2, CURRENT_DATE, true)\`,
        [driver.id, data.assigned_vehicle_id]
      );
    }

    return {
      driver_id: driver.id,
      name: driver.full_name,
      email: data.email,
      phone: driver.phone,
      nic_number: driver.nic_number,
      license_number: driver.license_number,
      license_class: driver.license_class,
      license_expiry: driver.license_expiry,
      assigned_vehicle_id: data.assigned_vehicle_id || null
    };
  }

  static async updateDriverProfile(driverId: string, data: Partial<{
    name: string;
    phone: string;
    nic_number: string;
    license_number: string;
    license_expiry: string;
  }>) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name) {
      fields.push(\`full_name = $\${idx++}\`);
      values.push(data.name);
    }
    if (data.phone) {
      fields.push(\`phone = $\${idx++}\`);
      values.push(data.phone);
    }
    if (data.nic_number) {
      fields.push(\`nic_number = $\${idx++}\`);
      values.push(data.nic_number);
    }
    if (data.license_number) {
      fields.push(\`license_number = $\${idx++}\`);
      values.push(data.license_number);
    }
    if (data.license_expiry) {
      fields.push(\`license_expiry = $\${idx++}\`);
      values.push(data.license_expiry);
    }

    if (fields.length === 0) {
      return this.findById(driverId);
    }

    fields.push(\`updated_at = CURRENT_TIMESTAMP\`);
    values.push(driverId);

    const res = await query(
      \`UPDATE core.drivers SET \${fields.join(', ')} WHERE id = $\${idx} RETURNING *\`,
      values
    );
    return res.rows[0];
  }
}
`;

const tripRepoContent = `import { query } from '../config/db';

export class TripRepository {
  static async getActiveTripForDriver(driverId: string) {
    const res = await query(
      \`SELECT t.*, v.registration_number, v.model
       FROM biz.trips t
       JOIN core.vehicles v ON t.vehicle_id = v.id
       WHERE t.driver_id = $1 AND t.status IN ('IN_PROGRESS', 'SCHEDULED')
       ORDER BY t.created_at DESC LIMIT 1\`,
      [driverId]
    );
    return res.rows[0] || null;
  }

  static async startTrip(driverId: string, vehicleId: string, routeId: string = 'route-138') {
    const res = await query(
      \`INSERT INTO biz.trips (driver_id, vehicle_id, route_id, status, start_time, current_halt_index, passenger_count)
       VALUES ($1, $2, $3, 'IN_PROGRESS', CURRENT_TIMESTAMP, 1, 0)
       RETURNING *\`,
      [driverId, vehicleId, routeId]
    );
    return res.rows[0];
  }

  static async logHaltCompletion(tripId: string, haltId: string, sequenceNo: number, boardedPassengers: number) {
    const res = await query(
      \`INSERT INTO biz.trip_halt_log (trip_id, halt_id, sequence_no, boarded_passengers)
       VALUES ($1, $2, $3, $4)
       RETURNING *\`,
      [tripId, haltId, sequenceNo, boardedPassengers]
    );

    // Update trip active halt index and passenger count
    await query(
      \`UPDATE biz.trips
       SET current_halt_index = $1, passenger_count = passenger_count + $2
       WHERE id = $3\`,
      [sequenceNo + 1, boardedPassengers, tripId]
    );

    return res.rows[0];
  }

  static async completeTrip(tripId: string) {
    const res = await query(
      \`UPDATE biz.trips
       SET status = 'COMPLETED', end_time = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *\`,
      [tripId]
    );

    const trip = res.rows[0];
    if (!trip) return null;

    // Get completed halts count from biz.trip_halt_log
    const haltLogRes = await query(
      \`SELECT COUNT(*) as completed_halts FROM biz.trip_halt_log WHERE trip_id = $1\`,
      [tripId]
    );

    return {
      ...trip,
      completed_halts: parseInt(haltLogRes.rows[0].completed_halts || '0')
    };
  }

  static async getDriverStatsToday(driverId: string) {
    const res = await query(
      \`SELECT 
         COALESCE(SUM(passenger_count), 0) as today_passengers,
         COUNT(*) as today_trips
       FROM biz.trips
       WHERE driver_id = $1 AND DATE(created_at) = CURRENT_DATE\`,
      [driverId]
    );
    return res.rows[0];
  }
}
`;

fs.writeFileSync('c:/Users/x13/Desktop/Projects/rapid-route-driver-app-backend/src/repositories/driver.repository.ts', driverRepoContent);
fs.writeFileSync('c:/Users/x13/Desktop/Projects/rapid-route-driver-app-backend/src/repositories/trip.repository.ts', tripRepoContent);
console.log('Successfully updated backend repository files to match database schema.');
