import { FileText } from 'lucide-react';
import { Button } from "../ui/button";
import NavLink from "./nav-link";

export default function Header() {
    const isLoggedIn = false;
    return (
        <nav className="container flex items-center justify-between
        py-4 lg: px - 8 px - 2 mx - auto">
            < div className="flex lg:flex-1" >
                <NavLink href="/" className="flex items-center gap-1 lg:gap-2 shrink-0">
                    <FileText className="w-5 h-5 lg:w-8 lg:h-8 text-gray-900 hover:rotate-12 
                transition-transform duration-300 ease-in-out" />
                    <span className="font-extrabold lg:text-xl text-gray-900">Sumaristaai</span>
                </NavLink>
            </div >
            <div className="flex lg:justify-center gap-4 lg:gap-12 lg:items-center">
                <NavLink href="/#pricing">Preços</NavLink>
                {isLoggedIn && <NavLink href="/dashboard">Seus sumários</NavLink>}
            </div>
            <div className="flex lg:flex-1 lg:justify-end">
                {isLoggedIn ? (
                    <div className="flex gap-2 items-center">
                        <NavLink href="/upload">Enviar PDF</NavLink>
                        <div>Pro</div>
                        <Button>Usuário</Button>
                    </div>
                ) : (
                    <div>
                        <NavLink href="/sign-in">Entrar</NavLink>
                    </div>
                )}
            </div>
        </nav >
    );
}