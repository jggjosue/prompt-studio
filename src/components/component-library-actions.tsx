'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue } from '@/components/ui/select';
import { useComponentLibrary } from '@/hooks/use-component-library';
import { FolderPlus,Heart } from 'lucide-react';
import { useEffect } from 'react';

export default function ComponentLibraryActions({componentId}:{componentId:string}){const{state,toggleFavorite,markRecent,addToGroup}=useComponentLibrary();const favorite=state.favorites.includes(componentId);useEffect(()=>{markRecent(componentId)},[componentId]);return <div className="rounded-xl border bg-muted/30 p-3"><p className="text-xs font-black">Guardar componente</p><div className="mt-2 grid grid-cols-2 gap-2"><Button size="sm" variant={favorite?'default':'outline'} onClick={()=>toggleFavorite(componentId)}><Heart className={`mr-1 size-3.5 ${favorite?'fill-current':''}`}/>{favorite?'Guardado':'Favorito'}</Button><Button size="sm" variant="outline" asChild><Link href="/my-components"><FolderPlus className="mr-1 size-3.5"/>Biblioteca</Link></Button></div>{state.projects.length?<Select onValueChange={projectId=>addToGroup('projects',projectId,componentId)}><SelectTrigger className="mt-2 h-9 text-xs"><SelectValue placeholder="Añadir a proyecto…"/></SelectTrigger><SelectContent>{state.projects.map(project=><SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>)}</SelectContent></Select>:<p className="mt-2 text-[9px] text-muted-foreground">Crea un proyecto en tu biblioteca para añadir este componente.</p>}</div>}
