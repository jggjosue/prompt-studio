import type{Metadata}from'next';import{CampaignAssistantClient}from'./campaign-assistant-client';
export const metadata:Metadata={title:'Centro de campañas | Prompt Studio',description:'Controla el recorrido completo desde el brief hasta la publicación.'};export default function Page(){return <CampaignAssistantClient/>}
