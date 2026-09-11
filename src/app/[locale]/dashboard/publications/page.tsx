import type{Metadata}from'next';import{PublicationsClient}from'./publications-client';
export const metadata:Metadata={title:'Publicaciones | Prompt Studio',description:'Publica, conecta dominios y exporta tus landing pages.'};
export default function Page(){return <PublicationsClient/>}
