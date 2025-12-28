# Image Processing API

A high-performance image processing API built with **Bun**, **Hono**, and **Effect TS** for type-safe, functional error handling and dependency injection.

## Features

- **Fast Runtime** - Powered by Bun for exceptional performance
- **Type-Safe Effects** - Effect TS for functional error handling and DI
- **Image Processing** - Resize images with Sharp library
- **Smart Caching** - In-memory caching for processed thumbnails
- **Clean Architecture** - Service layer pattern with dependency injection

## Tech Stack

| Technology                               | Purpose                   |
| ---------------------------------------- | ------------------------- |
| [Bun](https://bun.sh)                    | Runtime & package manager |
| [Hono](https://hono.dev)                 | Web framework             |
| [Effect TS](https://effect.website)      | Functional effects & DI   |
| [Sharp](https://sharp.pixelplumbing.com) | Image processing          |
| [Zod](https://zod.dev)                   | Schema validation         |

## Requirements

- [Bun](https://bun.sh) v1.0+

## Installation

```bash
git clone https://github.com/your-username/image-processing-api.git
cd image-processing-api
bun install
```

## Usage

### Development (with hot reload)

```bash
bun run dev
```

### Production

```bash
bun run start
```

### API Endpoint

```
GET /api/images?filename={name}&width={w}&height={h}
```

**Parameters:**

- `filename` - Image name without extension (e.g., `fjord`)
- `width` - Target width in pixels
- `height` - Target height in pixels

**Example:**

```bash
curl "http://localhost:3000/api/images?filename=fjord&width=200&height=200"
```

### Health Check

```bash
curl http://localhost:3000/health
```

## Project Structure

```
src/
├── index.ts            # Bun server entry point
├── app.ts              # Hono app configuration
├── errors.ts           # Effect tagged error types
├── schemas.ts          # Zod validation schemas
├── routes/
│   └── images.ts       # Image processing route
└── services/
    ├── index.ts        # Service exports & AppLayer
    ├── FileSystem.ts   # File operations service
    ├── ImageProcessor.ts # Sharp operations service
    └── Cache.ts        # In-memory cache service
```

## Configuration

Source images go in `./assets/full/` and thumbnails are cached in `./assets/thumb/`.

## License

MIT License. See [LICENSE](LICENSE) for details.
