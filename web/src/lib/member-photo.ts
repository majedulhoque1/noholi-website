import { useEffect, useState } from "react";
import { supabase } from "./supabase";

// A member's profile photo lives in the private `member-photos` bucket under
// `members/<member id>/` (see supabase/migrations/20261014000200_member_photo_and_prefs.sql) and
// `members.avatar` holds the object path. The member and the librarians read it by signed URL.

const TTL = 3600;
const cache = new Map<string, { url: string; at: number }>();

const isUrl = (v: string) => /^(https?:|data:|blob:)/.test(v);

/** Signed URL for an avatar path (or the value itself when it is already a URL). Null on failure. */
export async function photoUrl(avatar: string | null | undefined): Promise<string | null> {
  if (!avatar) return null;
  if (isUrl(avatar)) return avatar;
  const hit = cache.get(avatar);
  if (hit && Date.now() - hit.at < (TTL - 300) * 1000) return hit.url;
  const { data, error } = await supabase.storage.from("member-photos").createSignedUrl(avatar, TTL);
  if (error || !data?.signedUrl) return null;
  cache.set(avatar, { url: data.signedUrl, at: Date.now() });
  return data.signedUrl;
}

/** Displayable URL for `members.avatar`; null while loading, when unset, or when it cannot be read. */
export function useMemberPhotoUrl(avatar: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(() =>
    avatar && isUrl(avatar) ? avatar : (cache.get(avatar ?? "")?.url ?? null),
  );
  useEffect(() => {
    let live = true;
    if (!avatar) {
      setUrl(null);
      return;
    }
    photoUrl(avatar).then((u) => live && setUrl(u));
    return () => {
      live = false;
    };
  }, [avatar]);
  return avatar ? url : null;
}

/** Uploads a (compressed) photo to the member's own folder; returns the object path to store. */
export async function uploadMemberPhoto(memberId: string, blob: Blob): Promise<string> {
  const ext = blob.type === "image/jpeg" ? "jpg" : blob.type === "image/png" ? "png" : "webp";
  // A new name per upload so browsers and signed-URL caches never show the previous picture.
  const path = `members/${memberId}/photo-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("member-photos")
    .upload(path, blob, { contentType: blob.type, upsert: false });
  if (error) throw error;
  return path;
}

/** Best-effort removal of a previous photo object (own folder only); never throws. */
export async function removeMemberPhoto(path: string | null | undefined): Promise<void> {
  if (!path || isUrl(path)) return;
  cache.delete(path);
  await supabase.storage
    .from("member-photos")
    .remove([path])
    .catch(() => undefined);
}
