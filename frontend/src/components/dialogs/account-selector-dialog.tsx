import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { GitAccount } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AccountSelectorDialogProps {
    isOpen: boolean
    onClose: () => void
    onAccountSelect: (accountId: number) => void
    accounts: GitAccount[]
    currentAccountId: number | null | undefined
}

export function AccountSelectorDialog({
    isOpen,
    onClose,
    onAccountSelect,
    accounts,
    currentAccountId
}: AccountSelectorDialogProps) {
    const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
        accounts.find(a => a.id !== currentAccountId)?.id || accounts[0]?.id || null
    )

    const handleSubmit = () => {
        if (selectedAccountId !== null) {
            onAccountSelect(selectedAccountId)
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Select Account</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <ScrollArea className="h-[300px] pr-4">
                        <RadioGroup
                            value={selectedAccountId?.toString()}
                            onValueChange={(value) => setSelectedAccountId(parseInt(value, 10))}
                        >
                            {accounts
                                .filter(account => account.id !== currentAccountId)
                                .map(account => (
                                    <div key={account.id} className="flex items-center space-x-2 py-2 px-1 rounded hover:bg-accent">
                                        <RadioGroupItem value={account.id.toString()} id={account.id.toString()} />
                                        <Label htmlFor={account.id.toString()} className="flex-grow cursor-pointer">
                                            <div className="font-medium">{account.name}</div>
                                            <div className="text-sm text-muted-foreground">{account.account_type?.name}</div>
                                        </Label>
                                    </div>
                                ))}
                        </RadioGroup>
                    </ScrollArea>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="button" disabled={selectedAccountId === null} onClick={handleSubmit}>
                        Switch Account
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
