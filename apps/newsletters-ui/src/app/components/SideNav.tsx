import DraftsIcon from '@mui/icons-material/Drafts';
import InboxIcon from '@mui/icons-material/Inbox';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

export const SideNav = () => (
	<Box sx={{maxWidth: 300, bgcolor: 'background.paper', position: 'fixed', right: 0}}>
		<nav aria-label="form navigation links">
			<List>
				<ListItem disablePadding>
					<ListItemButton>
						<ListItemIcon>
							<InboxIcon/>
						</ListItemIcon>
						<ListItemText primary="Name"/>
					</ListItemButton>
				</ListItem>
				<ListItem disablePadding>
					<ListItemButton>
						<ListItemIcon>
							<DraftsIcon/>
						</ListItemIcon>
						<ListItemText primary="Production Category"/>
					</ListItemButton>
				</ListItem>
				<ListItem disablePadding>
					<ListItemButton>
						<ListItemIcon>
							<InboxIcon/>
						</ListItemIcon>
						<ListItemText primary="Promotion"/>
					</ListItemButton>
				</ListItem>
				<ListItem disablePadding>
					<ListItemButton>
						<ListItemIcon>
							<InboxIcon/>
						</ListItemIcon>
						<ListItemText primary="Pilllar & Group"/>
					</ListItemButton>
				</ListItem>
			</List>
		</nav>
		<Divider/>
		<nav aria-label="secondary mailbox folders">
			<List>
				<ListItem disablePadding>
					<ListItemButton>
						<ListItemText primary="Trash"/>
					</ListItemButton>
				</ListItem>
				<ListItem disablePadding>
					<ListItemButton component="a" href="#simple-list">
						<ListItemText primary="Spam"/>
					</ListItemButton>
				</ListItem>
			</List>
		</nav>
	</Box>
);
