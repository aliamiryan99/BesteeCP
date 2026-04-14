const fs = require('fs');
let content = fs.readFileSync('src/app/(dashboard)/tenants/[tenantId]/edit/page.tsx', 'utf8');

content = content.replace('export default function NewTenantPage() {', 'import { useParams } from "next/navigation";\nexport default function EditTenantPage() {');
content = content.replace('const createTenant = useMutation(api.tenants.tenants.create);', 'const updateTenant = useMutation(api.tenants.tenants.update);\n  const params = useParams() as any;\n  const tenantId = params.tenantId;\n  const initialData = useQuery(api.tenants.tenants.get, { tenantId });');

const insertAfterStr = 'const [staff, setStaff] = useState<MemberState[]>([]);';
const useEff = `
  const [dataLoaded, setDataLoaded] = useState(false);
  
  useEffect(() => {
    if (initialData && !dataLoaded) {
      setName(initialData.name || "");
      setSubdomain(initialData.subdomain || "");
      setTitle(initialData.siteContent?.title || "");
      setType(initialData.type as any || "barbers");
      setPhone(initialData.siteContent?.phone || "");
      setAddress(initialData.siteContent?.address || "");
      setSelectedDomain(initialData.mainDomain || null);
      setHeroTitle(initialData.siteContent?.heroTitle || "");
      setHeroSubTitle(initialData.siteContent?.heroSubTitle || "");
      setAboutUsText(initialData.siteContent?.aboutUsText || "");
      if (initialData.siteContent?.location?.latitude) {
        setLocation({ lat: initialData.siteContent.location.latitude, lng: initialData.siteContent.location.longitude });
      }
      if (initialData.siteContent?.certificateImageUrl) {
        setCertificatePreview(initialData.siteContent.certificateImageUrl);
      }
      setTelegram(initialData.siteContent?.socialLinks?.telegram || "");
      setInstagram(initialData.siteContent?.socialLinks?.instagram || "");
      setWhatsapp(initialData.siteContent?.socialLinks?.whatsapp || "");
      if (initialData.settings?.startWorkingTime) {
        setStartHour(initialData.settings.startWorkingTime.hour);
        setStartMinute(initialData.settings.startWorkingTime.minute);
      }
      if (initialData.settings?.endWorkingTime) {
        setEndHour(initialData.settings.endWorkingTime.hour);
        setEndMinute(initialData.settings.endWorkingTime.minute);
      }
      if (initialData.settings?.workingWeekdays) setWorkingDays(initialData.settings.workingWeekdays);
      if (initialData.settings?.breaks) setBreaks(initialData.settings.breaks as any);
      
      const mapUserToMember = (u: any) => ({
         type: "existing",
         userId: u._id,
         name: u.name,
         newUser: { ...EMPTY_NEW_USER }
      });
      if (initialData.owners?.length > 0) setOwners(initialData.owners.map(mapUserToMember));
      if (initialData.staff?.length > 0) setStaff(initialData.staff.map(mapUserToMember));
      
      setDataLoaded(true);
    }
  }, [initialData, dataLoaded]);
`;
content = content.replace(insertAfterStr, insertAfterStr + '\n' + useEff);

content = content.replace(/ثبت شعبه جدید/g, 'ویرایش شعبه');
content = content.replace(/با موفقیت ایجاد شد/g, 'با موفقیت ویرایش شد');
content = content.replace('await createTenant(payload);', 'await updateTenant({ ...payload, tenantId });');
content = content.replace('import { useState, useRef, useCallback, useMemo } from "react";', 'import { useState, useRef, useCallback, useMemo, useEffect } from "react";');

fs.writeFileSync('src/app/(dashboard)/tenants/[tenantId]/edit/page.tsx', content);
