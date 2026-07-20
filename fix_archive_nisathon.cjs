const fs = require('fs');
let code = fs.readFileSync('pages/ArchiveNisathon.tsx', 'utf8');

const replacement = `const ContributionHistorySection: React.FC<{ events: any[] }> = ({ events }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("all");
    const [page, setPage] = useState(1);
    const itemsPerPage = 20;

    const filterOptions = [
        { id: 'all', label: 'All' },
        { id: 'sub', label: 'Subs' },
        { id: 'gift', label: 'Gifts' },
        { id: 'bits', label: 'Bits' },
        { id: 'donation', label: 'Donations' }
    ];

    const filteredEvents = events.filter(e => {
        if (filter !== 'all' && e.type !== filter) return false;
        if (searchQuery && e.user && !e.user.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
    const currentEvents = filteredEvents.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const getEventColor = (type: string) => {
        if (type === 'sub' || type === 'gift') return 'text-purple-400 border-purple-500/30';
        if (type === 'bits') return 'text-pink-400 border-pink-500/30';
        if (type === 'donation') return 'text-emerald-400 border-emerald-500/30';
        return 'text-gray-400 border-gray-500/30';
    };

    const getEventIcon = (type: string) => {
        if (type === 'sub' || type === 'gift') return '⭐';
        if (type === 'bits') return '💎';
        if (type === 'donation') return '💸';
        return '🔹';
    };

    const formatTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString();
    };

    return (`;

code = code.replace(/    return \(/, replacement);

fs.writeFileSync('pages/ArchiveNisathon.tsx', code);
