import { v2 as cloudinary } from 'cloudinary';

// Cloudinary 설정 초기화
if (typeof process.env.CLOUDINARY_CLOUD_NAME === 'string') {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Cloudinary 이미지 URL 생성
 * @param publicId - Cloudinary에 업로드된 이미지의 public_id
 * @param options - 이미지 변환 옵션
 * @returns 최적화된 이미지 URL
 */
export function getCloudinaryImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number | 'auto';
    format?: 'auto' | 'webp' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'limit';
    gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
    fetchFormat?: 'auto';
  } = {}
): string {
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
    fetchFormat = 'auto',
  } = options;

  // 기본 URL 생성
  const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;

  // 변환 파라미터 구성
  const transformations: string[] = [];

  if (width || height) {
    const size = width && height ? `w_${width},h_${height}` : width ? `w_${width}` : `h_${height}`;
    transformations.push(size);
  }

  if (crop) {
    transformations.push(`c_${crop}`);
  }

  if (gravity && crop === 'fill') {
    transformations.push(`g_${gravity}`);
  }

  if (quality) {
    transformations.push(`q_${quality}`);
  }

  if (format) {
    transformations.push(`f_${format}`);
  }

  if (fetchFormat) {
    transformations.push(`fl_${fetchFormat}`);
  }

  const transformString = transformations.length > 0 ? `${transformations.join(',')}/` : '';

  // publicId가 이미 URL인 경우 처리
  if (publicId.startsWith('http')) {
    return publicId;
  }

  // publicId가 이미 변환된 URL인 경우 처리
  if (publicId.includes('res.cloudinary.com')) {
    return publicId;
  }

  return `${baseUrl}/${transformString}${publicId}`;
}

/**
 * Cloudinary에 이미지 업로드 (서버 사이드 전용)
 * @param file - 업로드할 파일 (Buffer 또는 base64 문자열)
 * @param folder - Cloudinary 폴더 경로 (선택사항)
 * @param publicId - 커스텀 public_id (선택사항)
 * @returns 업로드된 이미지 정보
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  folder?: string,
  publicId?: string
): Promise<{
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
}> {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error('CLOUDINARY_CLOUD_NAME 환경 변수가 설정되지 않았습니다.');
  }

  const uploadOptions: any = {
    folder: folder || 'rauvfilm',
    resource_type: 'image',
  };

  if (publicId) {
    uploadOptions.public_id = publicId;
  }

  // Buffer인 경우
  if (Buffer.isBuffer(file)) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
              url: result.url,
              width: result.width,
              height: result.height,
              format: result.format,
            });
          } else {
            reject(new Error('업로드 결과가 없습니다.'));
          }
        }
      );
      uploadStream.end(file);
    });
  }

  // base64 문자열인 경우
  const result = await cloudinary.uploader.upload(file, uploadOptions);
  return {
    public_id: result.public_id,
    secure_url: result.secure_url,
    url: result.url,
    width: result.width,
    height: result.height,
    format: result.format,
  };
}

/**
 * Cloudinary 이미지 삭제 (서버 사이드 전용)
 * @param publicId - 삭제할 이미지의 public_id
 * @returns 삭제 결과
 */
export async function deleteFromCloudinary(publicId: string): Promise<{
  result: string;
}> {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error('CLOUDINARY_CLOUD_NAME 환경 변수가 설정되지 않았습니다.');
  }

  const result = await cloudinary.uploader.destroy(publicId);
  return result;
}
