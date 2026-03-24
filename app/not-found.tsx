import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="text-center space-y-6">
        {/* 404 Number */}
        <div className="text-9xl font-bold text-[var(--text-faint)]">
          404
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-[var(--text)]">
          페이지를 찾을 수 없습니다
        </h1>

        {/* Description */}
        <p className="text-[var(--text-muted)] max-w-md mx-auto">
          요청하신 페이지가 존재하지 않거나 이동되었습니다. 대시보드로 돌아가세요.
        </p>

        {/* Back button */}
        <Link href="/dashboard">
          <Button size="lg">대시보드로 돌아가기</Button>
        </Link>
      </div>
    </div>
  );
}
