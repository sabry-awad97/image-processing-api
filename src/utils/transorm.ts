import sharp from 'sharp';

export async function transform(
  input: string,
  output: string,
  width: number,
  height: number
): Promise<void> {
  try {
    await sharp(input)
      .resize(width, height, {
        fit: sharp.fit.inside,
        withoutEnlargement: true
      })
      .toFile(output);
  } catch (error) {
    console.log(`An error occurred during processing: ${error}`);
  }
}
