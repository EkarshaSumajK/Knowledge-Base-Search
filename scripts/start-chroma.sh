#!/bin/bash

echo "🚀 Starting ChromaDB..."

# Check if Docker is installed
if command -v docker &> /dev/null; then
    echo "✓ Docker found"
    
    # Check if ChromaDB container is already running
    if docker ps | grep -q chromadb; then
        echo "✓ ChromaDB is already running"
        exit 0
    fi
    
    # Check if container exists but is stopped
    if docker ps -a | grep -q chromadb; then
        echo "Starting existing ChromaDB container..."
        docker start chromadb
    else
        echo "Creating new ChromaDB container..."
        docker run -d --name chromadb -p 8000:8000 chromadb/chroma
    fi
    
    echo "✓ ChromaDB started on http://localhost:8000"
    echo ""
    echo "Test connection:"
    echo "curl http://localhost:8000/api/v1/heartbeat"
    
else
    echo "❌ Docker not found"
    echo ""
    echo "Please install Docker or use Python:"
    echo "  pip install chromadb"
    echo "  chroma run --path ./chroma_data"
fi
