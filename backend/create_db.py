from decouple import config
import mysql.connector

conn = mysql.connector.connect(
    host=config('DB_HOST'),
    user=config('DB_USER'),
    password=config('DB_PASSWORD')
)

print("Connected successfully")