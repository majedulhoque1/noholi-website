import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MERIT_GRADES, type DefaultGuarantor, type MemberInput } from "@/hooks/use-members";

const lbl = "text-[12px] font-medium text-muted-foreground";
const inp = "h-8 text-[13px]";

export const isMemberInputValid = (v: MemberInput) => !!v.name.trim() && !!v.phone.trim();

/** Shared by Add Member and Edit Member. */
export function MemberFormFields({ value, onChange, showStatus = true }: {
  value: MemberInput;
  onChange: (v: MemberInput) => void;
  showStatus?: boolean;
}) {
  const set = <K extends keyof MemberInput>(k: K, v: MemberInput[K]) => onChange({ ...value, [k]: v });
  const setG = (k: keyof DefaultGuarantor, v: string) => onChange({ ...value, guarantor: { ...value.guarantor, [k]: v } });

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className={lbl}>Full Name *</label>
        <Input aria-label="Full Name" value={value.name} onChange={(e) => set("name", e.target.value)} className={inp} placeholder="Enter full name" maxLength={200} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className={lbl}>Phone *</label>
          <Input aria-label="Phone" value={value.phone} onChange={(e) => set("phone", e.target.value)} className={inp} placeholder="+880..." maxLength={30} />
        </div>
        <div className="space-y-1">
          <label className={lbl}>Email</label>
          <Input aria-label="Email" type="email" value={value.email} onChange={(e) => set("email", e.target.value)} className={inp} placeholder="member@email.com" maxLength={200} />
        </div>
      </div>
      <div className="space-y-1">
        <label className={lbl}>National ID (NID)</label>
        <Input aria-label="NID" value={value.nid} onChange={(e) => set("nid", e.target.value)} className={`${inp} font-mono`} maxLength={30} />
        <p className="text-[11px] text-muted-foreground">Lists only ever show the last 4 digits.</p>
      </div>

      {showStatus && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className={lbl}>Status</label>
            <Select value={value.status} onValueChange={(v) => set("status", v as MemberInput["status"])}>
              <SelectTrigger className={inp} aria-label="Status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className={lbl}>Merit Grade</label>
            <Select value={value.meritGrade} onValueChange={(v) => set("meritGrade", v as MemberInput["meritGrade"])}>
              <SelectTrigger className={inp} aria-label="Merit Grade"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MERIT_GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      {showStatus && (
        <div className="space-y-1">
          <label className={lbl}>Merit Note (optional)</label>
          <Textarea aria-label="Merit Note" value={value.meritNote} onChange={(e) => set("meritNote", e.target.value)} className="text-[13px] min-h-[52px]" maxLength={1000} />
        </div>
      )}

      <div className="pt-1">
        <p className={`${lbl} mb-2`}>Address</p>
        <div className="space-y-2">
          <Input aria-label="Address Line" placeholder="Address Line" value={value.addressLine} onChange={(e) => set("addressLine", e.target.value)} className={inp} />
          <div className="grid grid-cols-3 gap-2">
            <Input aria-label="City" placeholder="City / Area" value={value.city} onChange={(e) => set("city", e.target.value)} className={inp} />
            <Input aria-label="District" placeholder="District" value={value.district} onChange={(e) => set("district", e.target.value)} className={inp} />
            <Input aria-label="Postal Code" placeholder="Postal Code" value={value.postalCode} onChange={(e) => set("postalCode", e.target.value)} className={inp} />
          </div>
        </div>
      </div>

      <div className="pt-1">
        <p className={`${lbl} mb-1`}>Default guarantor</p>
        <p className="text-[11px] text-muted-foreground mb-2">Used for loans and web requests unless another guarantor is given.</p>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input aria-label="Guarantor Name" placeholder="Name" value={value.guarantor.name} onChange={(e) => setG("name", e.target.value)} className={inp} />
            <Input aria-label="Guarantor Relationship" placeholder="Relationship" value={value.guarantor.relationship} onChange={(e) => setG("relationship", e.target.value)} className={inp} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input aria-label="Guarantor Phone" placeholder="Phone" value={value.guarantor.phone} onChange={(e) => setG("phone", e.target.value)} className={inp} />
            <Input aria-label="Guarantor NID" placeholder="NID" value={value.guarantor.nid} onChange={(e) => setG("nid", e.target.value)} className={`${inp} font-mono`} />
          </div>
          <Input aria-label="Guarantor Street" placeholder="Street" value={value.guarantor.street} onChange={(e) => setG("street", e.target.value)} className={inp} />
          <div className="grid grid-cols-3 gap-2">
            <Input aria-label="Guarantor City" placeholder="City / Area" value={value.guarantor.city} onChange={(e) => setG("city", e.target.value)} className={inp} />
            <Input aria-label="Guarantor District" placeholder="District" value={value.guarantor.district} onChange={(e) => setG("district", e.target.value)} className={inp} />
            <Input aria-label="Guarantor Postal Code" placeholder="Postal Code" value={value.guarantor.postalCode} onChange={(e) => setG("postalCode", e.target.value)} className={inp} />
          </div>
        </div>
      </div>
    </div>
  );
}
