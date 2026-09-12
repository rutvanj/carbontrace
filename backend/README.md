# CarbonTrace Backend

Windows setup and run instructions

1. Create virtualenv and activate

```powershell
python -m venv venv
venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
copy .env.example .env
python -m app.seed
uvicorn app.main:app --reload --port 8000
```

API URL: http://localhost:8000
Swagger UI: http://localhost:8000/docs
Health: GET http://localhost:8000/health

Demo credentials created by `python -m app.seed`:

- entry@example.com / entrypass (ENTRY)
- verifier@example.com / verifierpass (VERIFIER)
- admin@example.com / adminpass (ADMIN)

Database location (default): `carbontrace.db` in this folder.

If you change `DATABASE_URL` in `.env`, update accordingly.

Common Windows troubleshooting:
- Activate virtualenv using `venv\Scripts\activate`.
- If `uvicorn` is not found, ensure the virtualenv is activated.
- If port conflicts occur, change `PORT` in `.env` or pass `--port` to uvicorn.
