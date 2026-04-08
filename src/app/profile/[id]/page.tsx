import Link from "next/link";
import { notFound } from "next/navigation";
import { db, ensureTable, Profile } from "@/lib/db";
import CopyButtonClient from "./CopyButtonClient";
import ProfileAvatar from "@/components/ProfileAvatar";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
}

function facebookHref(val: string) {
  if (val.startsWith("http")) return val;
  return `https://facebook.com/${val}`;
}

function instagramHref(handle: string) {
  return `https://instagram.com/${handle.replace("@", "")}`;
}

export default async function ProfilePage({ params, searchParams }: Props) {
  await ensureTable();
  const { id } = await params;
  const { new: isNew } = await searchParams;

  const result = await db.execute({ sql: "SELECT * FROM Profile WHERE id = ?", args: [id] });
  const profile = result.rows[0] as unknown as Profile | undefined;

  if (!profile) notFound();

  const professions = profile.profession.split(",");
  const attributes = profile.attributes ? profile.attributes.split(",") : [];

  return (
    <div className="min-h-screen">
      {/* New profile success banner */}
      {isNew === "1" && (
        <div className="px-6 pt-6 max-w-4xl mx-auto">
          <div
            className="px-5 py-4 rounded-2xl text-sm font-medium"
            style={{
              background: "rgba(122,182,72,0.12)",
              border: "1px solid rgba(122,182,72,0.3)",
              color: "var(--accent)",
            }}
          >
            🎉 Hồ sơ của bạn đã được đăng! Chia sẻ liên kết này với mọi người.
          </div>
        </div>
      )}

      {/* Back link */}
      <div className="px-6 pt-6 max-w-4xl mx-auto">
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          ← Quay lại Khám Phá
        </Link>
      </div>

      {/* ── HERO BANNER ── */}
      <section className="px-6 pt-8 pb-0 max-w-4xl mx-auto">
        <div
          className="rounded-3xl overflow-hidden"
          style={{ border: "1px solid var(--border)" }}
        >
          {/* Cover / Avatar area */}
          <div
            className="relative flex flex-col items-center justify-center"
            style={{
              height: "280px",
              background: "linear-gradient(135deg, rgba(122,182,72,0.08) 0%, rgba(122,182,72,0.02) 50%, rgba(10,10,10,0.5) 100%)",
            }}
          >
            {/* Large avatar */}
            <ProfileAvatar
              photoUrl={profile.photoUrl}
              instagram={profile.instagram}
              facebook={profile.facebook}
              name={profile.name}
              size={128}
              style={{
                border: "4px solid var(--bg)",
                boxShadow: "0 0 0 2px rgba(122,182,72,0.3), 0 8px 32px rgba(0,0,0,0.4)",
              }}
            />

            {/* Name */}
            <h1
              className="text-3xl sm:text-4xl font-bold mt-5 text-center"
              style={{ letterSpacing: "-0.02em" }}
            >
              {profile.name}
            </h1>

            {/* City & Price */}
            <div className="flex items-center gap-3 mt-2">
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                📍 {profile.city}
              </p>
              {profile.priceTier && (
                <p className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
                  {Array(profile.priceTier).fill("₫").join("")}
                </p>
              )}
            </div>
          </div>

          {/* ── PROFESSIONS ── */}
          <div
            className="px-6 sm:px-10 py-6"
            style={{
              background: "var(--bg-card)",
              borderTop: "1px solid var(--border)",
            }}
          >
            <div className="flex flex-wrap gap-2.5 justify-center">
              {professions.map((p) => (
                <span
                  key={p}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold"
                  style={{
                    background: "rgba(122,182,72,0.15)",
                    color: "var(--accent)",
                    border: "1px solid rgba(122,182,72,0.3)",
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* ── ATTRIBUTES ── */}
          {attributes.length > 0 && (
            <div
              className="px-6 sm:px-10 py-5"
              style={{
                background: "var(--bg-card)",
                borderTop: "1px solid var(--border)",
              }}
            >
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-4 text-center"
                style={{ color: "var(--text-dim)" }}
              >
                Chuyên Môn
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {attributes.map((attr) => (
                  <span
                    key={attr}
                    className="px-4 py-2 rounded-full text-xs font-medium"
                    style={{
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {attr}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── BIO ── */}
          {profile.bio && (
            <div
              className="px-6 sm:px-10 py-6"
              style={{
                background: "var(--bg-card)",
                borderTop: "1px solid var(--border)",
              }}
            >
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-3 text-center"
                style={{ color: "var(--text-dim)" }}
              >
                Giới Thiệu
              </p>
              <p
                className="text-base leading-relaxed text-center max-w-lg mx-auto"
                style={{ color: "var(--text-muted)" }}
              >
                {profile.bio}
              </p>
            </div>
          )}

          {/* ── CONTACT ── */}
          <div
            className="px-6 sm:px-10 py-8"
            style={{
              background: "var(--bg-card)",
              borderTop: "1px solid var(--border)",
            }}
          >
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-5 text-center"
              style={{ color: "var(--text-dim)" }}
            >
              Liên Hệ
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href={`mailto:${profile.email}`}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold transition-all"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                ✉️ Email
              </a>

              {profile.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold transition-all"
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                    background: "var(--bg)",
                  }}
                >
                  📞 {profile.phone}
                </a>
              )}

              {profile.instagram && (
                <a
                  href={instagramHref(profile.instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold transition-all"
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                    background: "var(--bg)",
                  }}
                >
                  📸 @{profile.instagram}
                </a>
              )}

              {profile.facebook && (
                <a
                  href={facebookHref(profile.facebook)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold transition-all"
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                    background: "var(--bg)",
                  }}
                >
                  👤 Facebook
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── SHARE BAR ── */}
      <section className="px-6 py-6 max-w-4xl mx-auto">
        <div
          className="rounded-2xl p-5 flex items-center justify-between gap-4"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Chia sẻ hồ sơ này
          </p>
          <CopyButtonClient id={profile.id} />
        </div>
      </section>
    </div>
  );
}
