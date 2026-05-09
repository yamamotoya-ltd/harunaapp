import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Supabaseが未設定の場合はスキップ（ローカル開発時）
  if (!url || !key) {
    return NextResponse.next({ request });
  }

  const supabase = createServerClient(url, key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // 未ログインで保護ページへのアクセス
  if (!user && (path.startsWith("/mypage") || path.startsWith("/admin"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ログイン済みでログインページへのアクセス
  if (user && path === "/login") {
    return NextResponse.redirect(new URL("/mypage", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/mypage/:path*", "/admin/:path*", "/login"],
};
