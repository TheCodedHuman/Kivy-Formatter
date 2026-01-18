# Here we are fabricating backend for Kivy-Formatter in FastAPI

# Imports
from fastapi import FastAPI, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from parser import KVParser
from utils import validate_kv, how_many_lines

# Literals
app = FastAPI()

# MiddleWares
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],      # dev
    # allow_origins=["https://kivy-formatter-8veg.vercel.app"],    # prod
    allow_methods=['*'],
    allow_headers=['*'],
)

# Routes
@app.post("/format")
async def format_text(raw_code: str = Form(...)):
    isInputCorrect = validate_kv(raw_code)
    if not isInputCorrect:
        raise HTTPException(status_code=422, detail="Invalid KV syntax")

    parser_util = KVParser(raw_code)
    formatted = parser_util.parse_kivy()
    return { "parsed_json": formatted }


@app.post("/stats")
async def stats(raw_code: str = Form(...)):
    return {"lines": how_many_lines(raw_code)}
