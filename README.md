# NBA Real-time Game Replay System

A project to simulate and display real-time NBA game events, allowing replays of past games at various speeds using Kafka event streaming.

## Features

* **Game Replay:** Replay past NBA games.
* **Variable Speed:** Adjust playback speed. (48X/96X/192X)
* **Real-time UI:** Live event updates during replay.
* **Scalable:** Event-driven architecture with Kafka.
* **On-Demand Loading:** Load game into the stream during start up.

## Architecture

The system uses a microservices architecture centered around Apache Kafka:

![Real-time NBA Architecture](./docs/real-time-NBA-architecture.drawio.png)
