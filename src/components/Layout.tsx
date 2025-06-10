import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, useTheme } from "@mui/material";
import { LayoutDashboard, Users, Globe, Phone, LineChart, Calculator, Search, Settings } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Leads", path: "/Leads" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: Globe, label: "Websites", path: "/websites" },
  { icon: Phone, label: "Phone Numbers", path: "/phone-numbers" },
  { icon: LineChart, label: "Analytics", path: "/analytics" },
  { icon: Calculator, label: "Revenue", path: "/revenue" },
  { icon: Search, label: "Research", path: "/research" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const DRAWER_WIDTH = 240;

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight="bold" color="primary">
            RankRent Pro
          </Typography>
        </Box>
        <List>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <ListItem
                key={item.path}
                component={Link}
                to={item.path}
                sx={{
                  color: isActive ? "primary.main" : "text.primary",
                  backgroundColor: isActive ? "action.selected" : "transparent",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                  <Icon size={20} />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          p: 3,
          overflow: "auto",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
