# Image Processing API

This is an Express.js-based API that processes images using the `sharp` library. It allows users to retrieve and transform images by specifying their filename, width, and height.

## Features

- **Image Processing**: Resize images based on provided width and height.
- **Caching**: Cache processed images for quicker retrieval.
- **Error Handling**: Validation of input parameters and error handling for smoother user interaction.

## Requirements

- Node.js (v14 or higher)
- `npm` or `yarn`

## Installation

1. Clone this repository:

   `git clone https://github.com/your-username/image-processing-api.git`

2. Navigate to the project directory:

   `cd image-processing-api`

3. Install dependencies:

   `npm i`

## Usage

1. Start the server:

   `npm start`

2. Access the API using the endpoint:

   `GET /api/images?filename=image_name&width=desired_width&height=desired_height`

   Replace `image_name`, `desired_width`, and `desired_height` with the respective values.

## Configuration

- Adjust the `fullDir` and `thumbDir` variables in `index.ts` to match your directory structure.
- Fine-tune error messages, validations, and caching settings based on your requirements.

## Contributions

Contributions are welcome! If you find any issues or want to enhance the functionality, feel free to open a pull request or create an issue.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
