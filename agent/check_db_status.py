import pymysql

conn = pymysql.connect(
    host='103.108.220.145',
    port=3306,
    user='vgyuvmpi_gethotel_db',
    password='shriyanshking',
    database='vgyuvmpi_gethotel_db',
    autocommit=True,
    connect_timeout=8
)

with conn.cursor() as cur:
    cur.execute("SELECT id, name, listingType, isActive, contactPhone, createdAt FROM hotel ORDER BY id DESC LIMIT 10")
    print("--- LATEST 10 HOTELS SAVED ---")
    for r in cur.fetchall():
        print(f"ID #{r[0]}: {r[1]} | Phone: {r[4]} | Created: {r[5]}")

    cur.execute("SELECT COUNT(*) FROM hotel")
    total = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM hotel WHERE listingType = 'directory'")
    directory = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM hotel WHERE listingType = 'directory' AND (contactPhone IS NOT NULL AND contactPhone != '')")
    with_phone = cur.fetchone()[0]

    print("\n--- STATS ---")
    print(f"Total Hotels in DB: {total}")
    print(f"Directory Hotels: {directory}")
    print(f"With Phone: {with_phone} ({round(with_phone/directory*100, 1)}%)")
    print(f"Missing Phone: {directory - with_phone} ({round((directory - with_phone)/directory*100, 1)}%)")

conn.close()
