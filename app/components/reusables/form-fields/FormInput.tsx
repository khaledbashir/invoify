"use client";

// RHF
import { useFormContext } from "react-hook-form";

// ShadCn
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input, InputProps } from "@/components/ui/input";
import { useProposalContext } from "@/contexts/ProposalContext";
import { cn } from "@/lib/utils";

type FormInputProps = {
    name: string;
    label?: string;
    labelHelper?: string;
    placeholder?: string;
    vertical?: boolean;
    rightElement?: React.ReactNode;
} & InputProps;

const FormInput = ({
    name,
    label,
    labelHelper,
    placeholder,
    vertical = false,
    rightElement,
    ...props
}: FormInputProps) => {
    const { control } = useFormContext();
    const { aiFields } = useProposalContext();
    const isAiFilled = aiFields?.includes(name);

    const verticalInput = (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    {label && <FormLabel>{`${label}:`}</FormLabel>}

                    {labelHelper && (
                        <span className="text-xs"> {labelHelper}</span>
                    )}

                    <div className="relative flex items-center gap-2">
                        <FormControl>
                            <Input
                                {...field}
                                placeholder={placeholder}
                                className={cn(
                                    "w-full bg-zinc-950/50 border-zinc-800 transition-all duration-300",
                                    isAiFilled && "border-blue-500 ring-1 ring-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]",
                                    props.className
                                )}
                                {...props}
                            />
                        </FormControl>
                        {rightElement}
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
    );

    const horizontalInput = (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <div className="flex w-full gap-5 items-center text-sm">
                        {label && <FormLabel className="flex-1">{`${label}:`}</FormLabel>}
                        {labelHelper && (
                            <span className="text-xs"> {labelHelper}</span>
                        )}

                        <div className="flex-[2] relative flex items-center gap-2">
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder={placeholder}
                                    className={cn(
                                        "w-full bg-zinc-950/50 border-zinc-800 transition-all duration-300",
                                        isAiFilled && "border-blue-500 ring-1 ring-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]",
                                        props.className
                                    )}
                                    {...props}
                                />
                            </FormControl>
                            {rightElement}
                        </div>
                    </div>
                    <FormMessage className="text-right" />
                </FormItem>
            )}
        />
    );
    return vertical ? verticalInput : horizontalInput;
};

export default FormInput;
