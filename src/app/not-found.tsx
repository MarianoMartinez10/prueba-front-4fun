import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    return (
        <div className="flex h-[calc(100vh-80px)] flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-9xl font-extrabold text-primary font-headline">404</h1>
            <h2 className="text-2xl font-bold tracking-tight">Página no encontrada</h2>
            <p className="text-lg text-muted-foreground">Lo sentimos, la página que buscas no existe o ha sido movida.</p>
            <Button asChild className="mt-4" size="lg">
                <Link href="/">Volver al Inicio</Link>
            </Button>
        </div>
    )
}
