import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"

import { ExternalLink } from "lucide-react"
// import TransactionDetails from "./transaction-details"
// TransactionDetails
const DialogContainer = ({children, title}:{children:
    React.ReactNode; title:string}) => {

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={'ghost'}>
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">{title}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-transparent border-none shadow-none">
                {children}
            </DialogContent>
        </Dialog>
    )
}

export default DialogContainer; 
