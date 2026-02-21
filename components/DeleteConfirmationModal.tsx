'use client';

import { useState, useEffect } from 'react';
import { X, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    isDeleting?: boolean;
}

export function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Delete Job Posting',
    message = 'Are you sure you want to delete this job posting? This action cannot be undone and all associated data will be lost.',
    isDeleting = false
}: DeleteConfirmationModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                aria-hidden="true"
            />

            {/* Modal Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-[1000] w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="p-8">
                    {/* Icon Header */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl mb-4 ring-8 ring-red-50/50">
                            <Trash2 className="h-8 w-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 font-serif tracking-tight">
                            {title}
                        </h2>
                    </div>

                    {/* Warning Box */}
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-8 flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800 leading-relaxed font-medium">
                            {message}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <Button
                            variant="primary"
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/20 active:scale-95 transition-all"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Deleting Posting...
                                </>
                            ) : (
                                'Yes, Delete Posting'
                            )}
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            disabled={isDeleting}
                            className="w-full h-12 font-bold hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>

                {/* Bottom branding or subtle text */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-center italic">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        This operation is irreversible
                    </p>
                </div>
            </motion.div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
