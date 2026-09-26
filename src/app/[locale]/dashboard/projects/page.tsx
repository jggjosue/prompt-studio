import { ProjectsClient } from './projects-client';
export default async function ProjectsPage({searchParams}:{searchParams:Promise<{project?:string}>}){const{project}=await searchParams;return <ProjectsClient initialProjectId={project}/>}
