# Terrestre Integration - Quick Reference

## ⚡ Quick Commands

### Start Everything
```bash
# One-liner to start backend + frontend
bash start-all.sh
```

### Test Integration
```bash
bash test-integration.sh
```

### Backend Only
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

### Frontend Only
```bash
cd hackfools
npm run dev
```

### Access Points
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 📁 File Reference

| File | Purpose | Created |
|------|---------|---------|
| `src/types/dinosaur.ts` | Type definitions | ✅ |
| `src/services/api.ts` | API client (singleton) | ✅ |
| `src/hooks/useTerrialMap.ts` | State management hook | ✅ |
| `src/components/TerrestrialMap.tsx` | Map SVG renderer | ✅ |
| `src/pages/Terrestre.tsx` | Main page component | ✅ |

---

## 🔌 API Endpoints Used

```
GET  /graph                    → Grid structure (nodes + edges)
GET  /dinosaurs                → All dinosaurs status
POST /route                    → Calculate route A→B
DELETE /route/{client_id}      → Stop monitoring route
WS   /ws/{client_id}           → WebSocket stream (dinos_update)
```

---

## 🦖 Data Structure

### Dinosaur
```typescript
{
  id: number
  specie: string
  latitude: number
  longitude: number
  type: "herbivore" | "carnivore"
  status: "calm" | "stressed" | "aggressive"
  speed: number
  hunger: number (0-100)
  stress: number (0-100)
}
```

### Grid Node
```typescript
{
  id: "r0_c0"      // Row 0, Column 0
  lat: number
  lon: number
  row: number
  col: number
}
```

---

## 🎨 Color Coding

| Status | Color | Hex |
|--------|-------|-----|
| Calm | Green | #52B788 |
| Stressed | Yellow | #FFD60A |
| Aggressive | Red | #EF4444 |

---

## ⚙️ Configuration Values

**Backend Config** (`backend/config.py`):
- Grid: 8x8
- Block size: 150m
- Tick interval: 3 seconds
- Initial dinosaurs: 25

**Frontend Config** (`src/services/api.ts`):
- Backend URL: `http://localhost:8000`
- WebSocket URL: `ws://localhost:8000`

---

## 🐛 Troubleshooting

### Backend not responding
```bash
# Check if running on port 8000
curl http://localhost:8000/docs

# If not, start it:
cd backend && uvicorn main:app --reload
```

### WebSocket disconnects
```bash
# Check browser console (F12)
# Reload page (Ctrl+R or Cmd+R)
# Verify backend is still running
```

### No dinosaurs showing
```bash
# Backend database might be empty
rm backend/dinosaurs.db
# Restart backend - it will auto-generate 25 dinosaurs
```

### Map not rendering
```bash
# Verify graph data loaded:
curl http://localhost:8000/graph | python -m json.tool

# Check browser console for errors
```

---

## 📊 Performance

- **Grid rendering**: SVG with React memoization
- **Update frequency**: 3 seconds (controlled by backend)
- **Memory usage**: ~2-5MB (small SVG + data)
- **Network**: Minimal (only WebSocket diffs)

---

## 🔐 Security Notes

- CORS: Currently allows all origins (development only)
- Client ID: Generated per session (not cryptographically secure)
- WebSocket: No authentication (development only)

For production:
- Restrict CORS to known origins
- Add JWT authentication
- Use secure WebSocket (WSS)
- Implement rate limiting

---

## 📚 Related Files

- Full setup guide: [TERRESTRE_SETUP.md](./TERRESTRE_SETUP.md)
- Technical details: [hackfools/TERRESTRE_INTEGRATION.md](./hackfools/TERRESTRE_INTEGRATION.md)
- Backend docs: [backend/README.md](./backend/README.md)
- Summary: [INTEGRATION_SUMMARY.txt](./INTEGRATION_SUMMARY.txt)

---

## 🎯 Development Tips

### Hot Reload
Both frontend (npm run dev) and backend (uvicorn --reload) support hot reload.

### Debug WebSocket
```javascript
// In browser console:
new WebSocket('ws://localhost:8000/ws/debug-client')
.onmessage = msg => console.log(JSON.parse(msg.data))
```

### Inspect Database
```bash
sqlite3 backend/dinosaurs.db
SELECT id, specie, status, hunger, stress FROM dinosaurs;
```

### Clear Cache
```bash
# Frontend
rm -rf hackfools/node_modules hackfools/dist
npm install

# Backend
rm backend/dinosaurs.db
```

---

## ✅ Validation Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] Grid visible in Terrestre page
- [ ] Dinosaurs showing with correct colors
- [ ] Sidebar showing dinosaur counts
- [ ] WebSocket connected (green indicator)
- [ ] Numbers updating every ~3 seconds

---

## 🎓 Learning Resources

### React Concepts Used
- Hooks: `useState`, `useEffect`, `useRef`, `useMemo`
- Context: Not used (but could be added)
- Performance: Memoization with `useMemo`

### TypeScript Patterns
- Singleton pattern (API service)
- Generic types (WebSocket messages)
- Union types (Dinosaur status)
- Record types (Maps)

### WebSocket Patterns
- Connection lifecycle (open, message, error, close)
- Event-driven updates
- Client ID correlation

---

Last Updated: 2025-08-15
Integration Status: ✅ COMPLETE
