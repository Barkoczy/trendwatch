import {
  MoreVertical,
  Clock,
  ListPlus,
  Share2,
  Ban,
  ThumbsDown,
  Flag,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const VideoCardMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer rounded-full border-0 p-1 outline-0 hover:bg-transparent">
        <MoreVertical className="h-5 w-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="dark:border-primary w-56 border-white shadow-2xl"
      >
        <DropdownMenuItem>
          <Clock className="mr-2 h-4 w-4" />
          <span>Pozrieť neskôr</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ListPlus className="mr-2 h-4 w-4" />
          <span>Pridať do playlistu</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Share2 className="mr-2 h-4 w-4" />
          <span>Zdieľať</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive dark:text-red-500">
          <Ban className="mr-2 h-4 w-4" />
          <span>Nemám záujem</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive dark:text-red-500">
          <ThumbsDown className="mr-2 h-4 w-4" />
          <span>Neodporúčať kanál</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive dark:text-red-500">
          <Flag className="mr-2 h-4 w-4" />
          <span>Nahlásiť</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default VideoCardMenu;
