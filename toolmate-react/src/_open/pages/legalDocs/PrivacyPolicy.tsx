import { PrivacyPolicyMd } from "@/LegalContent";
import DocsWrapper from "./DocsWrapper";

export default function PrivacyPolicy(){
    return (
        <DocsWrapper content={PrivacyPolicyMd} />
    )
}