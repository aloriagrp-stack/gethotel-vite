"""
GetHotelStays (GHS) - Terminal AI Agent & Live Control Center
Author: Antigravity AI Pair Programmer
Platform: Windows / Python 3.14 / Rich CLI
Covers: ALL HOTELS ACROSS INDIA (Delhi NCR, Agra, Jaipur, Udaipur, Manali, Shimla, Goa, Varanasi, etc.)
Features: Auto-tracking, Clean Windows CLI layout, Auto-Fixing Overpriced & Underpriced hotels.
"""

import os
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
for p in [CURRENT_DIR, PROJECT_ROOT]:
    if p not in sys.path:
        sys.path.insert(0, p)

import json
import subprocess
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.prompt import Prompt, Confirm, IntPrompt, FloatPrompt
from rich import print as rprint

# Local agent modules
from api_client import GHSApiClient
from benchmarks import get_benchmark_rate, live_search_rate, ALL_HOTEL_BENCHMARKS
from rate_engine import analyze_rate, calculate_optimal_promotion, DEFAULT_OFFSET

console = Console()
CACHE_DIR = os.path.dirname(os.path.abspath(__file__))
KNOWN_HOTELS_FILE = os.path.join(CACHE_DIR, ".known_hotels.json")


def clear_screen():
    """Wipes Windows conhost / CMD buffer cleanly."""
    os.system('cls' if os.name == 'nt' else 'clear')


class GHSTerminalAgent:
    def __init__(self):
        self.api = GHSApiClient()
        self.hotels = []
        self.known_ids = set()
        self.new_hotels = []
        self._load_hotels()

    def _load_known_ids(self) -> set:
        """Loads list of known/registered hotel IDs."""
        if os.path.exists(KNOWN_HOTELS_FILE):
            try:
                with open(KNOWN_HOTELS_FILE, "r", encoding="utf-8") as f:
                    return set(json.load(f))
            except Exception:
                pass
        return set()

    def _save_known_ids(self, ids: set):
        """Saves known hotel IDs to disk."""
        try:
            with open(KNOWN_HOTELS_FILE, "w", encoding="utf-8") as f:
                json.dump(sorted(list(ids)), f, indent=2)
        except Exception:
            pass

    def _load_hotels(self, force_refresh=False):
        """Fetches live hotels from GHS platform or fast cache and tracks newly onboarded ones."""
        with console.status("[bold cyan]Connecting to GetHotelStays.com Live API...[/bold cyan]", spinner="dots"):
            raw_hotels = self.api.get_hotels(force_refresh=force_refresh)
            # STRICT ISOLATION: Directory hotels have ZERO connection to pricing, rate engines, or promotions!
            # self.hotels contains ONLY active bookable partner hotels.
            self.hotels = [h for h in raw_hotels if h.get("listingType") != "directory"]
            self.directory_hotels = [h for h in raw_hotels if h.get("listingType") == "directory"]

        # Detect newly onboarded BOOKABLE partner hotels (directory hotels are strictly excluded)
        self.known_ids = self._load_known_ids()
        if not self.known_ids:
            self.known_ids = {h["id"] for h in self.hotels}
            self._save_known_ids(self.known_ids)
            self.new_hotels = []
        else:
            self.new_hotels = [h for h in self.hotels if h["id"] not in self.known_ids]

    def display_banner(self):
        clear_screen()
        banner_content = (
            "[bold cyan]========================================================================================[/bold cyan]\n"
            "  [bold white]GETHOTELSTAYS.COM — AI RATE & PROMOTION CONTROL CENTER[/bold white]\n"
            "  [bold green]● LIVE PLATFORM CONNECTED[/bold green] [bold white]|[/bold white] [bold yellow]Super Admin Mode[/bold yellow] [bold white]|[/bold white] [bold magenta]Rule: Untouched Base Rate, Target = Market - ₹150[/bold magenta]\n"
            "[bold cyan]========================================================================================[/bold cyan]"
        )
        console.print(banner_content)

        if self.new_hotels:
            summary = ", ".join([f"[cyan][ID {h['id']}] {h['name']}[/cyan]" for h in self.new_hotels[:3]])
            if len(self.new_hotels) > 3:
                summary += f" ...and {len(self.new_hotels) - 3} more"
            console.print(Panel(
                f"[bold green]🔔 {len(self.new_hotels)} NEW ONBOARDED HOTEL(S) DETECTED![/bold green]\n{summary}\n"
                f"[bold yellow]👉 Run Option [8] to auto-search MMT prices & activate sweet spot promos![/bold yellow]",
                border_style="green",
                expand=False
            ))

    def filter_hotels_by_scope(self):
        """Interactive selector for choosing hotels scope: All India or by City."""
        console.print("\n[bold yellow]📍 SELECT HOTELS SCOPE:[/bold yellow]")
        console.print(f"  [bold green][A][/bold green] 🇮🇳 [bold white]ALL HOTELS ACROSS INDIA[/bold white] ({len(self.hotels)} hotels)")
        console.print("  [bold cyan][1][/bold cyan] 🏛️  Delhi NCR (51 hotels)")
        console.print("  [bold cyan][2][/bold cyan] 🕌 Agra (9 hotels)")
        console.print("  [bold cyan][3][/bold cyan] 🏰 Jaipur (4 hotels)")
        console.print("  [bold cyan][4][/bold cyan] 🌊 Udaipur (4 hotels)")
        console.print("  [bold cyan][5][/bold cyan] 🏔️  Manali & Shimla (5 hotels)")
        console.print("  [bold cyan][6][/bold cyan] 🏖️  Goa (2 hotels)")
        console.print("  [bold cyan][7][/bold cyan] 🛕 Varanasi & Jodhpur (4 hotels)")
        console.print("  [bold cyan][8][/bold cyan] 🔍 Custom City Search / Filter")
        console.print("  [bold red][0][/bold red] 🔙 Back to Main Menu\n")

        choice = Prompt.ask("Choose scope", choices=["A", "a", "1", "2", "3", "4", "5", "6", "7", "8", "0"], default="A").upper()

        if choice == "0":
            return None, "Cancelled"
        elif choice == "A":
            return self.hotels, "All India (All Hotels)"
        elif choice == "1":
            hlist = [h for h in self.hotels if "delhi" in (h.get("city") or "").lower() or "delhi" in (h.get("address") or "").lower() or "paharganj" in (h.get("address") or "").lower() or "karol" in (h.get("address") or "").lower()]
            return hlist, "Delhi NCR"
        elif choice == "2":
            hlist = [h for h in self.hotels if "agra" in (h.get("city") or "").lower() or "agra" in (h.get("address") or "").lower()]
            return hlist, "Agra"
        elif choice == "3":
            hlist = [h for h in self.hotels if "jaipur" in (h.get("city") or "").lower() or "jaipur" in (h.get("name") or "").lower()]
            return hlist, "Jaipur"
        elif choice == "4":
            hlist = [h for h in self.hotels if "udaipur" in (h.get("city") or "").lower() or "udaipur" in (h.get("name") or "").lower()]
            return hlist, "Udaipur"
        elif choice == "5":
            hlist = [h for h in self.hotels if any(k in (h.get("city") or "").lower() or k in (h.get("name") or "").lower() for k in ["manali", "shimla"])]
            return hlist, "Manali & Shimla"
        elif choice == "6":
            hlist = [h for h in self.hotels if "goa" in (h.get("city") or "").lower() or "goa" in (h.get("name") or "").lower()]
            return hlist, "Goa"
        elif choice == "7":
            hlist = [h for h in self.hotels if any(k in (h.get("city") or "").lower() or k in (h.get("name") or "").lower() for k in ["varanasi", "jodhpur"])]
            return hlist, "Varanasi & Jodhpur"
        elif choice == "8":
            q = Prompt.ask("Enter city or area name to filter").lower().strip()
            hlist = [h for h in self.hotels if q in (h.get("city") or "").lower() or q in (h.get("address") or "").lower() or q in (h.get("name") or "").lower()]
            return hlist, f"Filter: '{q}'"

        return self.hotels, "All Hotels"

    def audit_hotels(self, offset=DEFAULT_OFFSET):
        """Displays full comparison table with Base Price, Current Promo %, GHS Display, Target, and Status."""
        self.display_banner()
        hotel_subset, scope_label = self.filter_hotels_by_scope()
        if not hotel_subset:
            return

        clear_screen()
        self.display_banner()
        console.print(f"\n[bold yellow]🔍 AUDITING {len(hotel_subset)} HOTELS: {scope_label.upper()} (Target: Market - ₹{offset})[/bold yellow]\n")

        with console.status(f"[bold cyan]Scanning market rates for {len(hotel_subset)} hotels...[/bold cyan]", spinner="dots"):
            analyzed_list, underpriced_list, overpriced_list = self._analyze_subset(hotel_subset, offset=offset)

        table = Table(title=f"Rate & Promotion Audit: {scope_label} (Target: Market - ₹{offset})", border_style="cyan", show_lines=True)
        table.add_column("ID", justify="center", style="bold cyan", width=4)
        table.add_column("Hotel Name", style="bold white", width=22)
        table.add_column("City", style="dim cyan", width=11)
        table.add_column("Base Rate\n(Untouched)", justify="right", style="bold white", width=11)
        table.add_column("Current\nPromo %", justify="center", style="bold yellow", width=8)
        table.add_column("GHS Display\n(Live)", justify="right", style="bold green", width=12)
        table.add_column("MMT Market\n(Online)", justify="right", style="bold yellow", width=11)
        table.add_column(f"Target Price\n(-₹{offset})", justify="right", style="bold blue", width=12)
        table.add_column("Optimal\nPromo %", justify="center", style="bold magenta", width=9)
        table.add_column("Status", justify="center", width=13)

        for a in analyzed_list:
            if a["status"] == "UNDERPRICED":
                status_str = "[bold red]UNDERPRICED[/bold red]"
            elif a["status"] == "MATCHED":
                status_str = "[bold green]MATCHED ✓[/bold green]"
            else:
                status_str = "[bold yellow]OVERPRICED[/bold yellow]"

            curr_promo_str = f"{a['current_promo_pct']}%" if a['current_promo_pct'] > 0 else "0%"
            needed_promo_str = f"[bold magenta]{a['needed_promo_pct']}%[/bold magenta]"

            table.add_row(
                str(a["hotel_id"]),
                a["name"][:21],
                str(a.get("city", "Delhi"))[:10],
                f"₹{a['base_room_price']}",
                curr_promo_str,
                f"₹{a['ghs_display_price']}",
                f"₹{a['market_min']}",
                f"₹{a['target_price']}",
                needed_promo_str,
                status_str
            )

        console.print(table)
        console.print(f"\n[bold green]✓ Scanned Hotels:[/bold green] {len(hotel_subset)} | "
                      f"[bold red]⚠️ Underpriced (Too cheap):[/bold red] {len(underpriced_list)} | "
                      f"[bold yellow]⚠️ Overpriced (Too high):[/bold yellow] {len(overpriced_list)} | "
                      f"[bold green]🎯 Matched/Sweet Spot:[/bold green] {len(hotel_subset) - len(underpriced_list) - len(overpriced_list)}\n")
        
        console.print("[bold cyan]💡 Tip: Go to Menu Option [2] to AUTO-FIX all mismatched hotels in 1 click![/bold cyan]")
        Prompt.ask("\nPress Enter to return to menu")

    def auto_tune_promotions(self):
        """
        THE FIXER WIZARD:
        Tunes promotion percentage up/down so that:
            Final Customer Price = (Market Price - ₹150)
        Base room price is NEVER touched!
        Offers 1-click auto-fixing for:
            [1] All Mismatched (Both Overpriced & Underpriced)
            [2] Underpriced Only
            [3] Overpriced Only
            [4] All Hotels
            [5] Specific Hotel by ID
        """
        self.display_banner()
        console.print("\n[bold cyan]⚡ AUTO-FIX RATE & PROMOTION WIZARD[/bold cyan]")
        console.print("[dim white]Rule: Hotel base price remains 100% untouched. Agent adjusts only promotion discount % so customer sees Market Price - ₹150.[/dim white]\n")

        offset_str = Prompt.ask("Enter discount below live market price in ₹", default="150")
        offset = int(offset_str) if offset_str.isdigit() else 150

        hotel_subset, scope_label = self.filter_hotels_by_scope()
        if not hotel_subset:
            return

        clear_screen()
        self.display_banner()

        with console.status(f"[bold cyan]Analyzing {len(hotel_subset)} hotels in {scope_label}...[/bold cyan]", spinner="dots"):
            all_analyzed, underpriced, overpriced = self._analyze_subset(hotel_subset, offset=offset)

        mismatched = underpriced + overpriced

        console.print(f"\n[bold white]Scope:[/bold white] [bold cyan]{scope_label}[/bold cyan] ({len(hotel_subset)} hotels)")
        console.print(f"  [bold red]⚠️  Underpriced (Too cheap / promo too high):[/bold red] {len(underpriced)} hotels")
        console.print(f"  [bold yellow]⚠️  Overpriced (Too high / promo too low):[/bold yellow] {len(overpriced)} hotels")
        console.print(f"  [bold green]🎯 Matched (Already at Market - ₹{offset} sweet spot):[/bold green] {len(hotel_subset) - len(mismatched)} hotels\n")

        console.print("[bold yellow]⚡ CHOOSE HOW YOU WANT TO FIX THEM:[/bold yellow]\n")
        console.print(f"  [bold green][1][/bold green] 🎯 [bold white]AUTO-FIX ALL MISMATCHED HOTELS[/bold white] [bold green]({len(mismatched)} hotels)[/bold green] (Fixes BOTH underpriced & overpriced!)")
        console.print(f"  [bold cyan][2][/bold cyan] 📉 Fix UNDERPRICED Only ({len(underpriced)} hotels selling too cheap)")
        console.print(f"  [bold cyan][3][/bold cyan] 📈 Fix OVERPRICED Only ({len(overpriced)} hotels selling too high)")
        console.print(f"  [bold magenta][4][/bold magenta] 🌟 Sync ALL {len(hotel_subset)} HOTELS (Force all to Market - ₹{offset})")
        console.print("  [bold cyan][5][/bold cyan] 🏨 Fix a Single Hotel (By ID)")
        console.print("  [bold red][0][/bold red] 🔙 Cancel / Back\n")

        action_choice = Prompt.ask("Choose fix action", choices=["1", "2", "3", "4", "5", "0"], default="1")

        if action_choice == "0":
            return

        if action_choice == "1":
            target_hotels = mismatched
            if not target_hotels:
                console.print(f"[bold green]✓ All hotels in {scope_label} are already 100% matched at Market - ₹{offset}![/bold green]")
                Prompt.ask("\nPress Enter to return")
                return
        elif action_choice == "2":
            target_hotels = underpriced
            if not target_hotels:
                console.print(f"[bold green]✓ No underpriced hotels found in {scope_label}![/bold green]")
                Prompt.ask("\nPress Enter to return")
                return
        elif action_choice == "3":
            target_hotels = overpriced
            if not target_hotels:
                console.print(f"[bold green]✓ No overpriced hotels found in {scope_label}![/bold green]")
                Prompt.ask("\nPress Enter to return")
                return
        elif action_choice == "4":
            target_hotels = all_analyzed
        elif action_choice == "5":
            hid = IntPrompt.ask("Enter Hotel ID")
            target_hotels = [a for a in all_analyzed if a["hotel_id"] == hid]
            if not target_hotels:
                console.print(f"[bold red]Hotel ID {hid} not found in {scope_label}.[/bold red]")
                Prompt.ask("\nPress Enter to return")
                return

        # Show Clean Preview Table
        clear_screen()
        self.display_banner()
        console.print(f"\n[bold yellow]📋 PROMOTION ADJUSTMENT PREVIEW ({len(target_hotels)} Hotels to be Updated)[/bold yellow]\n")
        
        ptable = Table(border_style="yellow", show_lines=True)
        ptable.add_column("ID", justify="center", style="bold cyan", width=4)
        ptable.add_column("Hotel Name", style="bold white", width=22)
        ptable.add_column("City", style="dim cyan", width=11)
        ptable.add_column("Base Rate\n(Untouched)", justify="right", style="bold white", width=11)
        ptable.add_column("Current Issue", justify="center", width=13)
        ptable.add_column("Promo % Change", justify="center", style="bold magenta", width=15)
        ptable.add_column("New Price", justify="right", style="bold green", width=11)
        ptable.add_column("MMT Market", justify="right", style="bold yellow", width=11)
        ptable.add_column("Advantage", justify="center", style="bold cyan", width=11)

        for item in target_hotels:
            old_p = f"{item['current_promo_pct']}%"
            new_p = f"{item['needed_promo_pct']}%"
            final_p = item['resulting_display_price']
            mkt_p = item['market_min']
            adv = f"-₹{mkt_p - final_p}"
            issue_str = "[bold red]UNDERPRICED[/bold red]" if item["status"] == "UNDERPRICED" else "[bold yellow]OVERPRICED[/bold yellow]"

            ptable.add_row(
                str(item["hotel_id"]),
                item["name"][:21],
                str(item.get("city", "Delhi"))[:10],
                f"₹{item['base_room_price']}",
                issue_str,
                f"{old_p} ➔ [bold green]{new_p}[/bold green]",
                f"₹{final_p}",
                f"₹{mkt_p}",
                adv
            )

        console.print(ptable)
        console.print(f"\n[bold white]Ready to update promotions for [bold green]{len(target_hotels)} hotels[/bold green] live on [bold cyan]GetHotelStays.com[/bold cyan]?[/bold white]\n")

        confirm = Confirm.ask("Apply these PROMOTION updates LIVE to the website now?")
        if not confirm:
            console.print("[yellow]Cancelled. No changes made.[/yellow]")
            Prompt.ask("\nPress Enter to return")
            return

        # Perform Live Promotion Updates with real-time feedback
        console.print("\n[bold cyan]Applying live updates to GetHotelStays.com...[/bold cyan]\n")
        
        success_count = 0
        for item in target_hotels:
            hid = item["hotel_id"]
            code = item["coupon_code"] or "BASIC"
            new_discount = item["needed_promo_pct"]
            final_display = item["resulting_display_price"]

            # If hotel had no rooms (base was default), add a Deluxe Room so it takes the promo discount
            if item["rooms_count"] == 0:
                self.api.add_room(hid, {
                    "name": "Deluxe Room",
                    "pricePerNight": item["base_room_price"] if item["base_room_price"] > 1200 else item["market_min"],
                    "maxOccupancy": 2,
                    "bedConfiguration": "1 King Bed"
                })

            # Update all active coupon codes on this hotel to keep them in lockstep
            h_obj = next((h for h in self.hotels if h["id"] == hid), None)
            existing_coupons = (h_obj.get("coupon") or h_obj.get("coupons") or []) if h_obj else []
            codes_to_update = set([code, "BASIC"] + [c.get("code") for c in existing_coupons if c.get("code")])
            res = {"success": True}
            for c_code in codes_to_update:
                r = self.api.update_hotel_promotion(hid, c_code, new_discount)
                if not r.get("success"):
                    res = r
            if res.get("success"):
                success_count += 1
                console.print(f"[bold green]✓ LIVE UPDATED [ID {hid:2d}] {item['name'][:22]:22}:[/bold green] Promo [{code}] set to [bold yellow]{new_discount:2d}%[/bold yellow] (Base ₹{item['base_room_price']} untouched ➔ Customer sees: [bold green]₹{final_display}[/bold green] | MMT: ₹{item['market_min']})")
            else:
                console.print(f"[bold red]✗ Failed to update [ID {hid}] {item['name']}: {res.get('message')}[/bold red]")

        console.print(f"\n[bold green]🎉 SUCCESS: {success_count} / {len(target_hotels)} promotions updated live on GetHotelStays.com![/bold green]")
        self._load_hotels(force_refresh=True)
        Prompt.ask("\nPress Enter to return to menu")

    def _analyze_subset(self, hotel_subset, offset=DEFAULT_OFFSET):
        """Analyzes a subset of hotels and returns (all_analyzed, underpriced, overpriced)."""
        analyzed_list = []
        underpriced_list = []
        overpriced_list = []
        
        for h in hotel_subset:
            name = h.get("name", "")
            city = (h.get("city") or "Delhi").strip()
            mkt = get_benchmark_rate(name) or live_search_rate(name, f"{city} {h.get('address', '')}")
            analysis = analyze_rate(h, mkt, offset=offset)
            analyzed_list.append(analysis)
            if analysis["status"] == "UNDERPRICED":
                underpriced_list.append(analysis)
            elif analysis["status"] == "OVERPRICED":
                overpriced_list.append(analysis)
                
        return analyzed_list, underpriced_list, overpriced_list

    def setup_newly_onboarded_hotels(self):
        """
        Detects and configures rates & promotions for brand new hotels onboarded to GHS.
        - Scrapes MMT / Booking.com in real-time.
        - Calculates required promotional discount % so display = (MMT - ₹150).
        - Keeps Base room price 100% untouched.
        - Updates live website and registers hotel in known registry.
        """
        self.display_banner()
        console.print("\n[bold cyan]🆕 NEW ONBOARDED HOTELS DETECTOR & SETUP WIZARD[/bold cyan]\n")

        if not self.new_hotels:
            console.print("[bold green]✓ All hotels in database are already recognized and up-to-date! No unconfigured new hotels.[/bold green]\n")
            if Confirm.ask("Do you want to re-scan database against live API now?"):
                self._load_hotels(force_refresh=True)
                if not self.new_hotels:
                    console.print("[bold green]✓ Still no new hotels detected.[/bold green]")
                    Prompt.ask("\nPress Enter to return")
                    return
            else:
                Prompt.ask("\nPress Enter to return")
                return

        console.print(f"[bold yellow]Found {len(self.new_hotels)} newly onboarded hotel(s):[/bold yellow]\n")
        
        offset = 150
        analyzed_new = []

        with console.status("[bold cyan]Searching live MakeMyTrip & Booking.com rates for new hotels...[/bold cyan]", spinner="dots"):
            for h in self.new_hotels:
                name = h.get("name", "")
                city = (h.get("city") or "India").strip()
                mkt = live_search_rate(name, f"{city} {h.get('address', '')}")
                analysis = analyze_rate(h, mkt, offset=offset)
                analyzed_new.append(analysis)

        # Show Table
        table = Table(title="Newly Onboarded Hotels: Live Rate Matching Preview", border_style="green", show_lines=True)
        table.add_column("ID", justify="center", style="bold cyan", width=4)
        table.add_column("Hotel Name", style="bold white", width=22)
        table.add_column("City", style="dim cyan", width=11)
        table.add_column("Base Rate\n(Untouched)", justify="right", style="bold white", width=11)
        table.add_column("Discovered MMT\nMarket Rate", justify="right", style="bold yellow", width=15)
        table.add_column("Target Price\n(-₹150)", justify="right", style="bold blue", width=13)
        table.add_column("Optimal\nPromo %", justify="center", style="bold magenta", width=10)
        table.add_column("Customer Sees", justify="right", style="bold green", width=13)

        for a in analyzed_new:
            table.add_row(
                str(a["hotel_id"]),
                a["name"][:21],
                str(a.get("city", "India"))[:10],
                f"₹{a['base_room_price']}",
                f"₹{a['market_min']}",
                f"₹{a['target_price']}",
                f"[bold magenta]{a['needed_promo_pct']}%[/bold magenta]",
                f"[bold green]₹{a['resulting_display_price']}[/bold green]"
            )

        console.print(table)
        console.print(f"\n[bold white]Apply these promotions to newly onboarded hotels live on GetHotelStays.com?[/bold white]")

        if Confirm.ask("Update newly onboarded hotels live now?"):
            for a in analyzed_new:
                hid = a["hotel_id"]
                code = a["coupon_code"] or "BASIC"
                self.api.update_hotel_promotion(hid, code, a["needed_promo_pct"])
                self.known_ids.add(hid)
                console.print(f"[bold green]✓ Activated [ID {hid}] {a['name']}:[/bold green] Promo [{code}] set to [bold yellow]{a['needed_promo_pct']}%[/bold yellow] (Customer sees: ₹{a['resulting_display_price']})")

            self._save_known_ids(self.known_ids)
            self.new_hotels = []
            console.print("\n[bold green]🎉 All newly onboarded hotels successfully configured & synchronized![/bold green]")
        else:
            if Confirm.ask("Mark these hotels as known without updating promotions?"):
                for a in analyzed_new:
                    self.known_ids.add(a["hotel_id"])
                self._save_known_ids(self.known_ids)
                self.new_hotels = []
                console.print("[yellow]Marked as known.[/yellow]")

        Prompt.ask("\nPress Enter to return")

    def manual_hotel_editor(self):
        """Allows direct manual inspection and editing of promo % or hotel settings."""
        self.display_banner()
        console.print("\n[bold cyan]✏️  HOTEL & PROMOTION MANAGER[/bold cyan]\n")
        
        search_query = Prompt.ask("Enter Hotel ID or part of Hotel Name")
        matched = []
        for h in self.hotels:
            if search_query.isdigit() and h["id"] == int(search_query):
                matched = [h]
                break
            elif search_query.lower() in (h.get("name") or "").lower():
                matched.append(h)

        if not matched:
            console.print(f"[bold red]No hotel found matching '{search_query}'.[/bold red]")
            Prompt.ask("\nPress Enter to continue")
            return

        hotel = matched[0]
        full_hotel = self.api.get_hotel(hotel["id"]) or hotel
        rooms = full_hotel.get("room") or []
        coupons = full_hotel.get("coupon") or full_hotel.get("coupons") or []

        console.print(Panel(
            f"[bold white]ID:[/bold white] {hotel['id']} | [bold white]Name:[/bold white] [bold cyan]{hotel['name']}[/bold cyan]\n"
            f"[bold white]City:[/bold white] {hotel.get('city')} | [bold white]Active:[/bold white] {hotel.get('isActive')}\n"
            f"[bold white]Base Hotel Price:[/bold white] ₹{hotel.get('pricePerNight')}\n"
            f"[bold white]Active Coupons:[/bold white] {len(coupons)} ({[c.get('code') + ': ' + str(c.get('discountValue')) + '%' for c in coupons]})\n"
            f"[bold white]Total Rooms:[/bold white] {len(rooms)}",
            title=f"Hotel: {hotel['name']}",
            border_style="cyan"
        ))

        console.print("\n[bold yellow]What would you like to do?[/bold yellow]")
        console.print("  [1] Set Promotion % Discount (e.g. 20% / 30% / 50% - base rate untouched)")
        console.print("  [2] Auto-Tune this hotel's Promo to Market - ₹150")
        console.print("  [3] Toggle Active / Suspended status")
        console.print("  [0] Cancel / Back")

        choice = Prompt.ask("Choose option", choices=["1", "2", "3", "0"], default="1")

        if choice == "1":
            new_pct = IntPrompt.ask("Enter new promotion discount percentage (0 to 80)")
            code = coupons[0]["code"] if coupons else "BASIC"
            res = self.api.update_hotel_promotion(hotel["id"], code, new_pct)
            console.print(f"[bold green]✓ Updated promotion '{code}' to {new_pct}% LIVE on website![/bold green]")

        elif choice == "2":
            mkt = get_benchmark_rate(hotel["name"]) or live_search_rate(hotel["name"], hotel.get("address", ""))
            analysis = analyze_rate(full_hotel, mkt, offset=150)
            console.print(f"Market Min: ₹{analysis['market_min']} | Base: ₹{analysis['base_room_price']} | Recommended Promo: [bold green]{analysis['needed_promo_pct']}%[/bold green] (Customer sees: ₹{analysis['resulting_display_price']})")
            if Confirm.ask("Apply this promo % live?"):
                code = analysis["coupon_code"] or "BASIC"
                self.api.update_hotel_promotion(hotel["id"], code, analysis["needed_promo_pct"])
                console.print(f"[bold green]✓ Live promotion set to {analysis['needed_promo_pct']}%![/bold green]")

        elif choice == "3":
            res = self.api.toggle_status(hotel["id"])
            console.print(f"[bold green]✓ Hotel status toggled LIVE! Result: {res}[/bold green]")

        self._load_hotels(force_refresh=True)
        Prompt.ask("\nPress Enter to continue")

    def toggle_quick_action(self):
        """Quick toggle hotel status or trending."""
        self.display_banner()
        console.print("\n[bold cyan]⚡ QUICK HOTEL TOGGLES[/bold cyan]\n")
        hotel_id = IntPrompt.ask("Enter Hotel ID")
        hotel = self.api.get_hotel(hotel_id)
        if not hotel:
            console.print(f"[bold red]Hotel {hotel_id} not found.[/bold red]")
            Prompt.ask("\nPress Enter to continue")
            return

        console.print(f"Selected: [bold cyan]{hotel['name']}[/bold cyan] | Active: {hotel.get('isActive')} | Trending: {hotel.get('isTrending')} | Featured: {hotel.get('isFeatured')}")
        console.print("\n[bold yellow]Toggle Options:[/bold yellow]")
        console.print("  [1] Toggle Active / Suspended")
        console.print("  [2] Toggle Trending (Homepage)")
        console.print("  [3] Toggle Featured")
        console.print("  [0] Back")

        opt = Prompt.ask("Select", choices=["1", "2", "3", "0"], default="0")
        if opt == "1":
            r = self.api.toggle_status(hotel_id)
            console.print(f"[bold green]Toggled Active status LIVE: {r}[/bold green]")
        elif opt == "2":
            r = self.api.toggle_trending(hotel_id)
            console.print(f"[bold green]Toggled Trending status LIVE: {r}[/bold green]")
        elif opt == "3":
            r = self.api.toggle_featured(hotel_id)
            console.print(f"[bold green]Toggled Featured status LIVE: {r}[/bold green]")

        Prompt.ask("\nPress Enter to continue")

    def directory_manager(self):
        """Hotel Directory & Lead Center Module."""
        while True:
            self.display_banner()
            console.print("\n[bold cyan]📖 HOTEL DIRECTORY & LEAD GENERATION CENTER[/bold cyan]\n")
            console.print("  [bold cyan][1][/bold cyan] 📊 [bold white]View Directory Leads Leaderboard[/bold white] (Ranked by Guest Call Clicks)")
            console.print("  [bold green][2][/bold green] ⚡ [bold green]Convert Directory Hotel to Bookable Partner[/bold green] (1-Click Onboarding)")
            console.print("  [bold cyan][3][/bold cyan] 📞 [bold white]Set Direct Phone & Email on any Hotel[/bold white]")
            console.print("  [bold cyan][4][/bold cyan] 🔄 [bold white]Switch Listing Type[/bold white] (Directory <-> Bookable)")
            console.print("  [bold cyan][5][/bold cyan] 🌐 [bold white]Auto-Sync OTA Prices & Links[/bold white] (Booking.com & MMT)")
            console.print("  [bold yellow][6][/bold yellow] 📥 [bold yellow]Deep-Clone Listing from Booking.com URL (Auto-Downloads Photos)[/bold yellow]")
            console.print("  [bold green][7][/bold green] 🏙️  [bold green]Bulk Hotel Harvester (Queue 10-100 URLs -> Auto-Deduplicate -> Batch Clone)[/bold green]")
            console.print("  [bold red][0][/bold red] 🔙 Back to Main Menu\n")

            opt = Prompt.ask("Choose option", choices=["1", "2", "3", "4", "5", "6", "7", "0"], default="1")

            if opt == "0":
                break

            elif opt == "1":
                self.display_banner()
                console.print("\n[bold yellow]📊 DIRECTORY LEADS LEADERBOARD (Top Calls & Intent)[/bold yellow]\n")
                with console.status("[bold cyan]Fetching leads from database...[/bold cyan]", spinner="dots"):
                    leads = self.api.get_directory_leads()

                if not leads:
                    leads = getattr(self, "directory_hotels", [])

                if not leads:
                    console.print("[yellow]No hotels currently set to 'directory' mode.[/yellow]")
                    console.print("[dim white]Tip: Use Option [4] to convert any hotel to 'directory' mode to test calls & contact display![/dim white]")
                else:
                    table = Table(title="Directory Leads: Top Hotels by Guest Phone Calls", border_style="green", show_lines=True)
                    table.add_column("ID", justify="center", style="bold cyan", width=4)
                    table.add_column("Hotel Name", style="bold white", width=25)
                    table.add_column("City", style="dim cyan", width=12)
                    table.add_column("Phone Number", style="bold yellow", width=15)
                    table.add_column("Call Clicks", justify="right", style="bold green", width=12)
                    table.add_column("Page Views", justify="right", style="bold blue", width=11)
                    table.add_column("Status / Opportunity", style="bold magenta", width=22)

                    for l in leads:
                        calls = l.get("callClicks", 0)
                        opp = "🔥 HOT LEAD (Call Now!)" if calls >= 50 else ("⚡ High Intent" if calls >= 10 else "🟢 New Directory")
                        table.add_row(
                            str(l["id"]),
                            l["name"][:24],
                            str(l.get("city", "Delhi"))[:11],
                            str(l.get("contactPhone") or "No phone"),
                            str(calls),
                            str(l.get("viewCount", 0)),
                            opp
                        )
                    console.print(table)
                Prompt.ask("\nPress Enter to continue")

            elif opt == "2":
                self.display_banner()
                console.print("\n[bold green]⚡ 1-CLICK ONBOARDING: DIRECTORY ➔ BOOKABLE PARTNER[/bold green]\n")
                hid = IntPrompt.ask("Enter Directory Hotel ID to convert to Bookable")
                hotel = self.api.get_hotel(hid)
                if not hotel:
                    console.print(f"[bold red]Hotel {hid} not found.[/bold red]")
                    Prompt.ask("\nPress Enter to continue")
                    continue

                console.print(f"Selected: [bold cyan]{hotel['name']}[/bold cyan] ({hotel.get('city')}) | Current Type: [bold yellow]{hotel.get('listingType', 'bookable')}[/bold yellow]")
                base_rate = FloatPrompt.ask("Enter Base Room Rate for online booking (₹)", default=float(hotel.get("pricePerNight") or 2500))
                
                rooms = hotel.get("room") or []
                if not rooms:
                    console.print("[dim white]Creating default Deluxe Room for booking...[/dim white]")
                    self.api.add_room(hid, {
                        "name": "Deluxe Room",
                        "pricePerNight": base_rate,
                        "maxOccupancy": 2,
                        "bedConfiguration": "1 King Bed"
                    })

                res = self.api.convert_listing_type(hid, listing_type="bookable", price_per_night=base_rate)
                console.print(f"[bold green]🎉 SUCCESS: [ID {hid}] {hotel['name']} is now LIVE as a BOOKABLE PARTNER on GetHotelStays.com![/bold green]")
                self._load_hotels(force_refresh=True)
                Prompt.ask("\nPress Enter to continue")

            elif opt == "3":
                self.display_banner()
                console.print("\n[bold cyan]📞 SET DIRECT HOTEL CONTACT DETAILS[/bold cyan]\n")
                hid = IntPrompt.ask("Enter Hotel ID")
                hotel = self.api.get_hotel(hid)
                if not hotel:
                    console.print(f"[bold red]Hotel {hid} not found.[/bold red]")
                    Prompt.ask("\nPress Enter to continue")
                    continue

                console.print(f"Selected: [bold cyan]{hotel['name']}[/bold cyan]")
                curr_phone = hotel.get("contactPhone") or ""
                curr_email = hotel.get("contactEmail") or ""
                new_phone = Prompt.ask("Enter Hotel Reception / Owner Phone Number", default=curr_phone)
                new_email = Prompt.ask("Enter Hotel Email", default=curr_email)

                res = self.api.convert_listing_type(hid, contact_phone=new_phone, contact_email=new_email)
                console.print(f"[bold green]✓ Updated contact details for [ID {hid}] {hotel['name']}![/bold green]")
                self._load_hotels(force_refresh=True)
                Prompt.ask("\nPress Enter to continue")

            elif opt == "4":
                self.display_banner()
                console.print("\n[bold cyan]🔄 SWITCH HOTEL LISTING TYPE[/bold cyan]\n")
                hid = IntPrompt.ask("Enter Hotel ID")
                hotel = self.api.get_hotel(hid)
                if not hotel:
                    console.print(f"[bold red]Hotel {hid} not found.[/bold red]")
                    Prompt.ask("\nPress Enter to continue")
                    continue

                curr_type = hotel.get("listingType") or "bookable"
                new_type = "directory" if curr_type == "bookable" else "bookable"
                console.print(f"Selected: [bold cyan]{hotel['name']}[/bold cyan] | Current Type: [bold yellow]{curr_type}[/bold yellow]")
                if Confirm.ask(f"Switch this hotel to '[bold magenta]{new_type}[/bold magenta]' mode?"):
                    res = self.api.convert_listing_type(hid, listing_type=new_type)
                    console.print(f"[bold green]✓ Switched to {new_type} mode: {res.get('message')}[/bold green]")
                    self._load_hotels(force_refresh=True)
                Prompt.ask("\nPress Enter to continue")

            elif opt == "5":
                self.display_banner()
                console.print("\n[bold cyan]🌐 AUTO-SYNC OTA PRICES & DEEP LINKS (Booking.com & MakeMyTrip)[/bold cyan]\n")
                dir_hotels = getattr(self, "directory_hotels", [])
                if not dir_hotels:
                    console.print("[yellow]No directory hotels found. Switch some hotels to 'directory' first![/yellow]")
                    Prompt.ask("\nPress Enter to continue")
                    continue
                
                console.print(f"Found [bold green]{len(dir_hotels)}[/bold green] directory hotels.\n")
                if Confirm.ask("Do you want to auto-fetch latest market rates and generate Booking.com deep links?"):
                    for dh in dir_hotels:
                        hname = dh.get("name", "")
                        hcity = (dh.get("city") or "India").strip()
                        hid = dh.get("id")
                        with console.status(f"[cyan]Searching Booking.com rate for {hname}...[/cyan]", spinner="dots"):
                            rate = get_benchmark_rate(hname) or live_search_rate(hname, f"{hcity} {dh.get('address', '')}")
                        
                        b_price = int(rate["avg"]) if rate and rate.get("avg") else 2800
                        b_url = dh.get("bookingUrl") or f"https://www.booking.com/searchresults.html?ss={hname.replace(' ', '+')}+{hcity}"
                        
                        self.api.convert_listing_type(hid, listing_type="directory", booking_url=b_url, booking_price=b_price)
                        console.print(f"  [green]✓[/green] [ID {hid}] {hname} ➔ Booking.com Starting Rate: ₹{b_price}")
                    
                    console.print("\n[bold green]🎉 Successfully synced Booking.com prices and affiliate links for all directory hotels![/bold green]")
                    self._load_hotels(force_refresh=True)
                Prompt.ask("\nPress Enter to continue")

            elif opt == "6":
                self.deep_clone_hotel_prompt()

            elif opt == "7":
                try:
                    from hotel_bulk_harvester import run_bulk_harvester
                except ImportError:
                    from agent.hotel_bulk_harvester import run_bulk_harvester
                run_bulk_harvester()
                self._load_hotels(force_refresh=True)

    def deep_clone_hotel_prompt(self):
        """Interactive module to clone all hotel details & download photos from Booking.com link."""
        self.display_banner()
        console.print("\n[bold cyan]📥 DEEP-CLONE HOTEL FROM BOOKING.COM / OTA[/bold cyan]")
        console.print("[dim white]Extracts Hotel Name, City, Address, Rating, Description, Amenities, Starting Rate & Downloads ALL HD Photos to server.[/dim white]\n")

        url = Prompt.ask("[bold green]Paste Booking.com (or OTA) Hotel URL[/bold green]")
        if not url.strip():
            console.print("[red]Cancelled: No URL provided.[/red]")
            Prompt.ask("\nPress Enter to continue")
            return

        max_photos = IntPrompt.ask("How many HD photos to download locally?", default=8)

        try:
            from hotel_deep_cloner import clone_hotel, save_to_mysql
        except ImportError:
            from agent.hotel_deep_cloner import clone_hotel, save_to_mysql

        with console.status("[bold cyan]Deep scraping listing & downloading high-res photos...[/bold cyan]", spinner="dots"):
            cloned = clone_hotel(url.strip(), max_photos=max_photos)

        if not cloned.get("success"):
            console.print(f"[bold red]❌ Failed to clone hotel:[/bold red] {cloned.get('error', 'Could not read property details')}")
            Prompt.ask("\nPress Enter to continue")
            return

        console.print(Panel(
            f"[bold white]Hotel Name:[/bold white] [bold green]{cloned.get('name')}[/bold green]\n"
            f"[bold white]City:[/bold white] [bold cyan]{cloned.get('city')}[/bold cyan]\n"
            f"[bold white]Address:[/bold white] {cloned.get('address') or 'N/A'}\n"
            f"[bold white]Star Rating:[/bold white] {'★' * cloned.get('starRating', 4)}\n"
            f"[bold white]Starting Rate:[/bold white] [bold yellow]₹{cloned.get('bookingPrice') or 'N/A'}[/bold yellow] /night\n"
            f"[bold white]Amenities ({len(cloned.get('amenities', []))}):[/bold white] {', '.join(cloned.get('amenities', []))}\n"
            f"[bold white]Cover Photo:[/bold white] [dim green]{cloned.get('thumbnail')}[/dim green]\n"
            f"[bold white]Gallery Photos Downloaded:[/bold white] [bold green]{cloned.get('downloadedPhotosCount', 0)} files in GetHotel backend/uploads/[/bold green]\n\n"
            f"[bold white]Description Excerpt:[/bold white]\n[dim]{cloned.get('description', '')[:250]}...[/dim]",
            title="✨ Cloned Property Details",
            border_style="green"
        ))

        if Confirm.ask("\n[bold green]Save this hotel directly to GHS Database as an active Directory Listing?[/bold green]", default=True):
            new_id = save_to_mysql(cloned)
            if new_id:
                console.print(f"\n[bold green]🎉 SUCCESS! Hotel listing created with ID #{new_id}![/bold green]")
                city_s = re.sub(r'[^a-z0-9\-]+', '', cloned.get('city', 'india').lower().replace(' ', '-'))
                hotel_s = re.sub(r'[^a-z0-9\-]+', '', cloned.get('name', '').lower().replace(' ', '-'))
                console.print(f"[dim white]Live URL slug: /hotels-directory/{city_s}/{hotel_s}[/dim white]")
                self._load_hotels(force_refresh=True)
            else:
                console.print("[bold red]Failed to save hotel to MySQL database.[/bold red]")

        Prompt.ask("\nPress Enter to continue")

    def git_push_deploy(self):
        """Commits and pushes changes to GitHub main branch to trigger production CI/CD."""
        self.display_banner()
        console.print("\n[bold cyan]🚀 DEPLOY CHANGES TO PRODUCTION (GITHUB CI/CD)[/bold cyan]\n")

        msg = Prompt.ask("Enter commit message", default="feat(rates): sync all-india hotel rates with market sweet spot")
        console.print("\n[bold cyan]Running Git push...[/bold cyan]")
        try:
            subprocess.run(["git", "add", "."], check=True)
            subprocess.run(["git", "commit", "-m", msg], check=False)
            res = subprocess.run(["git", "push", "origin", "main"], capture_output=True, text=True)
            console.print(res.stdout or res.stderr)
            console.print("\n[bold green]🎉 Pushed to origin main! GitHub Actions deployment started.[/bold green]")
        except Exception as e:
            console.print(f"[bold red]Deploy Error: {e}[/bold red]")

        Prompt.ask("\nPress Enter to continue")

    def run_menu(self):
        """Main loop for the terminal agent."""
        while True:
            self.display_banner()
            new_count_str = f" [bold red]({len(self.new_hotels)} NEW!)[/bold red]" if self.new_hotels else ""
            console.print(f"\n[bold yellow]⚡ SELECT AGENT ACTION ([green]{len(self.hotels)} Total Hotels Across India[/green]):[/bold yellow]\n")
            console.print("  [bold cyan][1][/bold cyan] 📊 [bold white]Audit Hotels & Rates[/bold white] (See Base, Promo %, Display Price vs MMT)")
            console.print("  [bold green][2][/bold green] ⚡ [bold green]AUTO-FIX OVERPRICED & UNDERPRICED HOTELS[/bold green] (1-Click Sweet Spot!)")
            console.print("  [bold cyan][3][/bold cyan] ✏️  [bold white]Edit Promotion % on Any Specific Hotel[/bold white] (Increase/Decrease % live)")
            console.print("  [bold cyan][4][/bold cyan] 🌐 [bold white]Live Web Search Market Rate for Any Hotel[/bold white] (DDGS Real-time MMT/Booking.com)")
            console.print("  [bold cyan][5][/bold cyan] 🎛️  [bold white]Quick Hotel Toggles[/bold white] (Active/Inactive, Trending, Featured)")
            console.print(f"  [bold cyan][8][/bold cyan] 🆕 [bold yellow]Setup Newly Onboarded Hotels[/bold yellow]{new_count_str} (Auto-find MMT price & set promo)")
            console.print("  [bold cyan][9][/bold cyan] 📖 [bold yellow]HOTEL DIRECTORY & LEAD CENTER[/bold yellow] (View Call Leads, 1-Click Converter)")
            console.print("  [bold yellow][10][/bold yellow] 📥 [bold yellow]Deep-Clone Hotel from Booking.com URL (Auto-Downloads Photos & Creates Listing)[/bold yellow]")
            console.print("  [bold green][11][/bold green] 🏙️  [bold green]Bulk Hotel Harvester (Queue 10-100 URLs -> Auto-Deduplicate -> Batch Clone)[/bold green]")
            console.print("  [bold yellow][12][/bold yellow] 📞 [bold yellow]Google Maps Hotel Contact Enricher (Auto-Find Front Desk Phone & Email)[/bold yellow]")
            console.print("  [bold cyan][6][/bold cyan] 🚀 [bold magenta]Push & Deploy Live to Production[/bold magenta] (GitHub CI/CD)")
            console.print("  [bold cyan][7][/bold cyan] 🔄 [bold white]Refresh Live Database Data[/bold white]")
            console.print("  [bold cyan][0][/bold cyan] 🚪 [bold red]Exit[/bold red]\n")

            choice = Prompt.ask("[bold green]ghs-agent >[/bold green]", choices=["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "0"], default="2")

            if choice == "1":
                self.audit_hotels()
            elif choice == "2":
                self.auto_tune_promotions()
            elif choice == "3":
                self.manual_hotel_editor()
            elif choice == "4":
                hname = Prompt.ask("Enter hotel name to search on MakeMyTrip / Booking.com")
                area = Prompt.ask("Enter city or locality (e.g. Paharganj, Agra, Jaipur, Goa)", default="India")
                with console.status("[bold cyan]Searching live OTAs...[/bold cyan]", spinner="dots"):
                    rate = live_search_rate(hname, area)
                console.print(Panel(
                    f"[bold white]Hotel:[/bold white] [bold cyan]{hname}[/bold cyan]\n"
                    f"[bold white]Market Min Rate:[/bold white] [bold green]₹{rate['min']}[/bold green]\n"
                    f"[bold white]Market Avg Rate:[/bold white] ₹{rate['avg']}\n"
                    f"[bold white]Target GHS Rate (₹150 cheaper):[/bold white] [bold yellow]₹{rate['min'] - 150}[/bold yellow]\n"
                    f"[bold white]Source:[/bold white] {rate['source']}",
                    title="Live Market Pricing Result",
                    border_style="green"
                ))
                Prompt.ask("\nPress Enter to return to menu")
            elif choice == "5":
                self.toggle_quick_action()
            elif choice == "8":
                self.setup_newly_onboarded_hotels()
            elif choice == "9":
                self.directory_manager()
            elif choice == "10":
                self.deep_clone_hotel_prompt()
            elif choice == "11":
                try:
                    from hotel_bulk_harvester import run_bulk_harvester
                except ImportError:
                    from agent.hotel_bulk_harvester import run_bulk_harvester
                run_bulk_harvester()
                self._load_hotels(force_refresh=True)
            elif choice == "12":
                try:
                    from google_maps_enricher import menu as enricher_menu
                except ImportError:
                    from agent.google_maps_enricher import menu as enricher_menu
                enricher_menu()
                self._load_hotels(force_refresh=True)
            elif choice == "6":
                self.git_push_deploy()
            elif choice == "7":
                self._load_hotels(force_refresh=True)
                console.print("[bold green]✓ Live data refreshed from GetHotelStays API![/bold green]")
                Prompt.ask("\nPress Enter to return to menu")
            elif choice == "0":
                console.print("[bold cyan]Goodbye! GHS Agent shutting down.[/bold cyan]")
                break


if __name__ == "__main__":
    agent = GHSTerminalAgent()
    if len(sys.argv) > 1 and sys.argv[1].lower() == "bulk":
        count = int(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2].isdigit() else None
        try:
            from hotel_bulk_harvester import run_bulk_harvester
        except ImportError:
            from agent.hotel_bulk_harvester import run_bulk_harvester
        run_bulk_harvester(target_count=count)
        sys.exit(0)

    if len(sys.argv) > 1 and sys.argv[1].startswith("http"):
        url = sys.argv[1]
        try:
            from hotel_deep_cloner import clone_hotel, save_to_mysql
        except ImportError:
            from agent.hotel_deep_cloner import clone_hotel, save_to_mysql
        agent.display_banner()
        console.print(f"\n[bold cyan]📥 DIRECT HOTEL URL RECEIVED:[/bold cyan] {url}\n")
        with console.status("[bold cyan]Deep scraping listing & downloading high-res photos...[/bold cyan]", spinner="dots"):
            cloned = clone_hotel(url, max_photos=8)
        if cloned.get("success"):
            console.print(Panel(
                f"[bold white]Hotel Name:[/bold white] [bold green]{cloned.get('name')}[/bold green]\n"
                f"[bold white]City:[/bold white] [bold cyan]{cloned.get('city')}[/bold cyan]\n"
                f"[bold white]Address:[/bold white] {cloned.get('address') or 'N/A'}\n"
                f"[bold white]Star Rating:[/bold white] {'★' * cloned.get('starRating', 4)}\n"
                f"[bold white]Starting Rate:[/bold white] [bold yellow]₹{cloned.get('bookingPrice') or 'N/A'}[/bold yellow] /night\n"
                f"[bold white]Amenities ({len(cloned.get('amenities', []))}):[/bold white] {', '.join(cloned.get('amenities', []))}\n"
                f"[bold white]Cover Photo:[/bold white] [dim green]{cloned.get('thumbnail')}[/dim green]\n"
                f"[bold white]Gallery Photos Downloaded:[/bold white] [bold green]{cloned.get('downloadedPhotosCount', 0)} files in GetHotel backend/uploads/[/bold green]",
                title="✨ Cloned Listing Details",
                border_style="green"
            ))
            if Confirm.ask("\n[bold green]Save this hotel to GHS Database as an active Directory Listing?[/bold green]", default=True):
                new_id = save_to_mysql(cloned)
                console.print(f"\n[bold green]🎉 SUCCESS! Hotel listing created with ID #{new_id}![/bold green]")
                agent._load_hotels(force_refresh=True)
        else:
            console.print(f"[bold red]❌ Failed to clone hotel:[/bold red] {cloned.get('error')}")
        Prompt.ask("\nPress Enter to enter main menu")
    agent.run_menu()
