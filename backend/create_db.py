import MySQLdb

try:
    db = MySQLdb.connect(
        host="localhost",
        user="root",
        passwd="ayu@2003"
    )
    cursor = db.cursor()
    cursor.execute("CREATE DATABASE IF NOT EXISTS hms_db;")
    db.commit()
    db.close()
    print("Database created successfully")
except Exception as e:
    print("Error creating database:", e)
