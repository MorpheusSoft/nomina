echo "=== REVISANDO ENV ==="
cat backend/.env | grep GEMINI
echo "=== LOGS DEL BACKEND ==="
pm2 logs nebula-backend --lines 30
