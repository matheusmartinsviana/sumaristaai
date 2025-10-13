import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useRef } from 'react';

export function NavigationControls({
    currentSection,
    totalSections,
    onPrevious,
    onNext,
    onSectionSelect,
}: {
    currentSection: number;
    totalSections: number;
    onPrevious: () => void;
    onNext: () => void;
    onSectionSelect: (index: number) => void;
}) {
    const touchStartX = useRef<number | null>(null);

    // Touch events para mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const deltaX = e.changedTouches[0].clientX - touchStartX.current;
        if (deltaX > 50) {
            onPrevious();
        } else if (deltaX < -50) {
            onNext();
        }
        touchStartX.current = null;
    };

    // Mouse events para desktop (opcional)
    const mouseStartX = useRef<number | null>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        mouseStartX.current = e.clientX;
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (mouseStartX.current === null) return;
        const deltaX = e.clientX - mouseStartX.current;
        if (deltaX > 50) {
            onPrevious();
        } else if (deltaX < -50) {
            onNext();
        }
        mouseStartX.current = null;
    };

    return (
        <div
            className="absolute bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xs border-t border-blue-500/10"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            <div className="flex justify-between items-center">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onPrevious}
                    disabled={currentSection === 0}
                    className={cn(
                        'rounded-full w-12 h-12 transition-all duration-200 bg-linear-to-br from-blue-500 to-blue-600 backdrop-blur-xs border border-blue-500/10',
                        currentSection === 0 ? 'opacity-50' : 'hover:bg-blue-500/20'
                    )}
                >
                    <ChevronLeft className="h-6 w-6 text-white" />
                </Button>

                <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground select-none gap-2 flex">
                        {Array.from({ length: totalSections }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => onSectionSelect(index)}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all duration-300",
                                    currentSection === index
                                        ? "bg-gradient-to-br from-blue-500 to-blue-600"
                                        : "bg-blue-500/20 hover:bg-blue-500/30"
                                )}
                                aria-label={`Ir para seção ${index + 1}`}
                            />
                        ))}
                    </span>
                    <span className="ml-3 text-xs text-blue-400 font-semibold select-none mt-3">
                        arraste por aqui para navegar
                    </span>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onNext}
                    disabled={currentSection === totalSections - 1}
                    className={cn(
                        'rounded-full w-12 h-12 transition-all duration-200 bg-linear-to-br from-blue-500 to-blue-600 backdrop-blur-xs border border-blue-500/10',
                        currentSection === totalSections - 1 ? 'opacity-50' : 'hover:bg-blue-500/20'
                    )}
                >
                    <ChevronRight className="h-6 w-6 text-white" />
                </Button>
            </div>
        </div>
    );
}

export default NavigationControls;
