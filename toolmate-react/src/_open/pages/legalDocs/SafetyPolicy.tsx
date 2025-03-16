import { SafetyPolicyMd } from "@/LegalContent";
import DocsWrapper from "./DocsWrapper";

export default function SafetyPolicy(){
    return (
        <DocsWrapper content={SafetyPolicyMd} />
    )
}