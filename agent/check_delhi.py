import pymysql

conn = pymysql.connect(
    host="103.108.220.145",
    port=3306,
    user="vgyuvmpi_gethotel_db",
    password="shriyanshking",
    database="vgyuvmpi_gethotel_db",
    cursorclass=pymysql.cursors.DictCursor
)

with conn.cursor() as cur:
    cur.execute("""
        SELECT LOWER(TRIM(city)) as clean_city, COUNT(*) as cnt 
        FROM hotel 
        WHERE listingType = 'directory' 
        GROUP BY LOWER(TRIM(city)) 
        ORDER BY cnt DESC
    """)
    cities = cur.fetchall()
    print("City distribution of directory hotels:")
    delhi_total = 0
    for c in cities:
        print(f"  • {c['clean_city']}: {c['cnt']}")
        if any(d in str(c['clean_city']) for d in ['delhi', 'new delhi', 'ncr', 'aerocity', 'mahipalpur', 'paharganj', 'karol bagh']):
            delhi_total += c['cnt']

    print(f"\nTotal Delhi & Delhi-NCR directory hotels currently in DB: {delhi_total}")
