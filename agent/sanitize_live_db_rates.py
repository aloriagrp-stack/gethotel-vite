import pymysql
import json

DB_CONFIG = {
    'host': '103.108.220.145',
    'user': 'vgyuvmpi_gethotel_user',
    'password': 'vgyuvmpi_gethotel_user',
    'database': 'vgyuvmpi_gethotel_db',
    'port': 3306,
    'connect_timeout': 10
}

try:
    conn = pymysql.connect(**DB_CONFIG)
    cur = conn.cursor()
    cur.execute('SELECT id, hotelId, hourlyRates, pricePerNight FROM room WHERE isHourlyEnabled = 1')
    rooms = cur.fetchall()
    print('Total hourly rooms in live DB:', len(rooms))
    updated = 0
    for r_id, h_id, hr_str, p_night in rooms:
        p_night = float(p_night or 1499)
        if not hr_str:
            continue
        try:
            hr = json.loads(hr_str) if isinstance(hr_str, str) else hr_str
        except Exception:
            continue
        r3 = float(hr.get('3', 0))
        r6 = float(hr.get('6', 0))
        r12 = float(hr.get('12', 0))

        if r3 > 2200 or r3 >= p_night or (r3 == r6 == r12 and r3 > 1200):
            new_r3 = max(499, min(1499, int(round((p_night * 0.35) / 10) * 10)))
            new_r6 = int(round((new_r3 * 1.35) / 10) * 10)
            new_r12 = int(round((new_r3 * 1.75) / 10) * 10)
            new_hr = json.dumps({'3': new_r3, '6': new_r6, '12': new_r12})
            cur.execute('UPDATE room SET hourlyRates = %s WHERE id = %s', (new_hr, r_id))
            updated += 1

    cur.execute("UPDATE hotel SET pricePerNight = 1899 WHERE name LIKE '%MVM Residency%'")
    cur.execute("UPDATE hotel SET pricePerNight = 1999 WHERE name LIKE '%BM Velvet%'")
    conn.commit()
    print(f'Sanitized {updated} room hourly rates in live database.')
    conn.close()
except Exception as e:
    print('DB notice:', e)
