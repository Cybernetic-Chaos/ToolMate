import { TermsOfService } from "@/LegalContent";
import DocsWrapper from "./DocsWrapper";

export default function TermAndCon(){
    return (
        <DocsWrapper content={TermsOfService}/>
    )
}