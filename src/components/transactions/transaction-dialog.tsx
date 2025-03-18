import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
import { ExternalLink } from "lucide-react"
import {Transaction} from "@/types/transactions"
import TransactionDetails from "./transaction-details"
TransactionDetails
const DialogContainer = ({transaction}:{transaction:Transaction}) => {

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={'ghost'}>
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">View transaction details</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="">
                <TransactionDetails transactionId={transaction.id}/>
            </DialogContent>
        </Dialog>
    )
}

export default DialogContainer; 
