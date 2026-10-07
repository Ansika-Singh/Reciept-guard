from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import asyncio

router = APIRouter(tags=["WebSockets"])

# Simple active connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {}

    async def connect(self, receipt_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[receipt_id] = websocket

    def disconnect(self, receipt_id: str):
        if receipt_id in self.active_connections:
            del self.active_connections[receipt_id]

    async def send_progress(self, receipt_id: str, data: dict):
        if receipt_id in self.active_connections:
            await self.active_connections[receipt_id].send_text(json.dumps(data))

manager = ConnectionManager()

@router.websocket("/ws/processing/{receipt_id}")
async def websocket_processing_timeline(websocket: WebSocket, receipt_id: str):
    await manager.connect(receipt_id, websocket)
    try:
        while True:
            # Keep alive loop
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(receipt_id)
