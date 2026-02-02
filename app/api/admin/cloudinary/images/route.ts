/**
 * Cloudinary 이미지 목록 조회 API
 * GET /api/admin/cloudinary/images
 */

import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdminAuth } from '@/lib/auth';

// Cloudinary 설정 초기화
if (typeof process.env.CLOUDINARY_CLOUD_NAME === 'string') {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function GET(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const authResponse = await requireAdminAuth(request);
    if (authResponse) {
      return authResponse;
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: 'Cloudinary 설정이 되어 있지 않습니다. .env에 CLOUDINARY_* 변수를 설정해주세요.' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || '';
    const maxResults = parseInt(searchParams.get('max_results') || '500');
    const nextCursor = searchParams.get('next_cursor');

    let result: any;

    // 폴더가 지정된 경우와 전체 이미지 검색을 다르게 처리
    if (folder && folder !== 'all') {
      // 특정 폴더 검색 - Admin API resources 사용 (prefix 옵션으로 더 안정적)
      console.log('폴더 검색:', folder);
      
      const options: any = {
        resource_type: 'image',
        type: 'upload',
        prefix: folder, // 폴더 경로를 prefix로 사용
        max_results: maxResults,
      };
      
      if (nextCursor) {
        options.next_cursor = nextCursor;
      }

      result = await cloudinary.api.resources(options);
      
      // Admin API 응답 형식을 Search API 형식으로 변환
      result = {
        resources: result.resources || [],
        next_cursor: result.next_cursor,
        total_count: result.resources?.length || 0,
      };
    } else {
      // 전체 이미지 검색 - Admin API resources 사용 (더 안정적)
      console.log('전체 이미지 검색 (Admin API 사용)');
      
      const options: any = {
        resource_type: 'image',
        type: 'upload',
        max_results: maxResults,
      };
      
      if (nextCursor) {
        options.next_cursor = nextCursor;
      }

      result = await cloudinary.api.resources(options);
      
      // Admin API 응답 형식을 Search API 형식으로 변환
      result = {
        resources: result.resources || [],
        next_cursor: result.next_cursor,
        total_count: result.resources?.length || 0,
      };
    }

    console.log('검색 결과:', result.total_count || result.resources?.length || 0, '개 이미지 발견');

    const images = (result.resources || []).map((resource: any) => ({
      publicId: resource.public_id,
      secureUrl: resource.secure_url,
      url: resource.url,
      width: resource.width,
      height: resource.height,
      format: resource.format,
      bytes: resource.bytes,
      createdAt: resource.created_at,
      folder: resource.folder || '',
    }));

    return NextResponse.json({
      images,
      nextCursor: result.next_cursor,
      totalCount: result.total_count || images.length,
    });
  } catch (error: any) {
    console.error('Cloudinary 이미지 목록 조회 오류:', error);
    return NextResponse.json(
      { 
        error: '이미지 목록을 불러오는데 실패했습니다.',
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}
