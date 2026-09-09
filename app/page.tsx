'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  Flame,
  Gamepad2,
  RotateCcw,
  Search,
  Shield,
  Sparkles,
  Swords,
  Trophy,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import latestPlayers from './players.json';

type PlayerStatus = '现役' | '替补' | '青训' | '退役';
type Role = '对抗路' | '打野' | '中路' | '发育路' | '游走' | '未知';
type Era = '2016—18' | '2019—21' | '2022—24' | '2025—26';
type Mode = 'all' | 'active' | 'reserve' | 'academy' | 'legend';
type CompareState = 'exact' | 'close' | 'miss';

type Player = {
  id: string;
  realName: string;
  team: string;
  status: PlayerStatus;
  role: Role;
  era: Era;
  champion: boolean;
  fmvp: boolean;
  aliases?: string[];
};

type Comparison = {
  state: CompareState;
  direction?: 'up' | 'down';
};

type GuessRow = {
  player: Player;
  comparison: Record<'team' | 'status' | 'role' | 'era' | 'champion' | 'fmvp', Comparison>;
};

const legacyPlayers: Player[] = [
  { id: '轩染', realName: '刘明', team: '成都AG超玩会', status: '现役', role: '对抗路', era: '2022—24', champion: true, fmvp: false },
  { id: '钟意', realName: '陈家豪', team: '成都AG超玩会', status: '现役', role: '打野', era: '2022—24', champion: true, fmvp: true },
  { id: '长生', realName: '谢承峻', team: '成都AG超玩会', status: '现役', role: '中路', era: '2022—24', champion: true, fmvp: false },
  { id: '一诺', realName: '徐必成', team: '成都AG超玩会', status: '现役', role: '发育路', era: '2019—21', champion: true, fmvp: true, aliases: ['诺队', '徐必成'] },
  { id: '大帅', realName: '孟家俊', team: '成都AG超玩会', status: '现役', role: '游走', era: '2022—24', champion: true, fmvp: false },
  { id: '小凡', realName: '陈一帆', team: '成都AG超玩会', status: '替补', role: '中路', era: '2022—24', champion: false, fmvp: false },
  { id: '小俞', realName: '周宇', team: '成都AG超玩会', status: '青训', role: '发育路', era: '2025—26', champion: false, fmvp: false },

  { id: '归期', realName: '双小钧', team: '重庆狼队', status: '现役', role: '对抗路', era: '2022—24', champion: true, fmvp: false },
  { id: '小胖', realName: '李达亨', team: '重庆狼队', status: '现役', role: '打野', era: '2019—21', champion: true, fmvp: true },
  { id: '紫幻', realName: '黄广顺', team: '重庆狼队', status: '现役', role: '中路', era: '2019—21', champion: true, fmvp: false },
  { id: '道崽', realName: '杨凯博', team: '重庆狼队', status: '现役', role: '发育路', era: '2022—24', champion: true, fmvp: false },
  { id: '信', realName: '苟宏鑫', team: '重庆狼队', status: '现役', role: '游走', era: '2022—24', champion: false, fmvp: false },
  { id: '清清', realName: '吴金翔', team: '重庆狼队', status: '替补', role: '对抗路', era: '2019—21', champion: true, fmvp: true },
  { id: '皖皖', realName: '杜远航', team: '重庆狼队', status: '青训', role: '打野', era: '2025—26', champion: false, fmvp: false },

  { id: 'Fly', realName: '彭云飞', team: '武汉eStarPro', status: '现役', role: '对抗路', era: '2016—18', champion: true, fmvp: true, aliases: ['飞牛', '彭云飞'] },
  { id: '小楼', realName: '沈宇轩', team: '武汉eStarPro', status: '现役', role: '打野', era: '2022—24', champion: false, fmvp: false },
  { id: 'Ming', realName: '池晓铭', team: '武汉eStarPro', status: '现役', role: '中路', era: '2022—24', champion: false, fmvp: false },
  { id: '亮宇', realName: '陈亮宇', team: '武汉eStarPro', status: '现役', role: '发育路', era: '2025—26', champion: false, fmvp: false },
  { id: '紫渊', realName: '侯维国', team: '武汉eStarPro', status: '现役', role: '游走', era: '2025—26', champion: false, fmvp: false },
  { id: '誓约', realName: '姚嘉鹏', team: '武汉eStarPro', status: '替补', role: '对抗路', era: '2022—24', champion: false, fmvp: false },

  { id: '轻语', realName: '谢欣臻', team: '北京JDG', status: '现役', role: '对抗路', era: '2022—24', champion: false, fmvp: false },
  { id: '无双', realName: '胡家荣', team: '北京JDG', status: '现役', role: '打野', era: '2022—24', champion: false, fmvp: false },
  { id: '清融', realName: '黄垚钦', team: '北京JDG', status: '现役', role: '中路', era: '2019—21', champion: true, fmvp: true },
  { id: '绝意', realName: '廖友侠', team: '北京JDG', status: '现役', role: '发育路', era: '2022—24', champion: true, fmvp: false },
  { id: '无畏', realName: '杨涛', team: '北京JDG', status: '现役', role: '游走', era: '2019—21', champion: true, fmvp: false },
  { id: '小玖', realName: '刘行', team: '北京JDG', status: '替补', role: '发育路', era: '2019—21', champion: false, fmvp: false },

  { id: '梓墨', realName: '吴喆杰', team: '北京WB', status: '现役', role: '对抗路', era: '2019—21', champion: true, fmvp: false },
  { id: '暖阳', realName: '林恒', team: '北京WB', status: '现役', role: '打野', era: '2019—21', champion: true, fmvp: true, aliases: ['林恒'] },
  { id: '听悦', realName: '吴佐', team: '北京WB', status: '现役', role: '中路', era: '2025—26', champion: false, fmvp: false },
  { id: '乔兮', realName: '曾庆龙', team: '北京WB', status: '现役', role: '发育路', era: '2022—24', champion: false, fmvp: false },
  { id: '玖欣', realName: '邹伟鑫', team: '北京WB', status: '现役', role: '游走', era: '2022—24', champion: false, fmvp: false },
  { id: '小麦', realName: '彭超平', team: '北京WB', status: '替补', role: '发育路', era: '2025—26', champion: false, fmvp: false },

  { id: '流星', realName: '李星', team: 'KSG', status: '现役', role: '对抗路', era: '2022—24', champion: false, fmvp: false },
  { id: '句号', realName: '何伟嘉', team: 'KSG', status: '现役', role: '打野', era: '2025—26', champion: false, fmvp: false },
  { id: '流浪', realName: '张恒', team: 'KSG', status: '现役', role: '中路', era: '2022—24', champion: false, fmvp: false },
  { id: '风箫', realName: '于翔任', team: 'KSG', status: '现役', role: '发育路', era: '2022—24', champion: true, fmvp: false },
  { id: '一笙', realName: '李自威', team: 'KSG', status: '现役', role: '游走', era: '2022—24', champion: true, fmvp: false },
  { id: '子阳', realName: '向阳', team: 'KSG', status: '替补', role: '游走', era: '2019—21', champion: true, fmvp: false },

  { id: '小乐', realName: '黄家乐', team: '深圳DYG', status: '现役', role: '对抗路', era: '2022—24', champion: false, fmvp: false },
  { id: '小轩', realName: '王胜', team: '深圳DYG', status: '现役', role: '打野', era: '2022—24', champion: false, fmvp: false },
  { id: '向鱼', realName: '蔡佑其', team: '深圳DYG', status: '现役', role: '中路', era: '2019—21', champion: true, fmvp: false },
  { id: '钎城', realName: '周诣涛', team: '深圳DYG', status: '现役', role: '发育路', era: '2019—21', champion: true, fmvp: false },
  { id: '落空', realName: '周熙瑞', team: '深圳DYG', status: '现役', role: '游走', era: '2022—24', champion: false, fmvp: false },

  { id: '坦然', realName: '孙麟威', team: '南通Hero久竞', status: '现役', role: '对抗路', era: '2019—21', champion: true, fmvp: true },
  { id: '落尘', realName: '张世杰', team: '南通Hero久竞', status: '现役', role: '打野', era: '2022—24', champion: false, fmvp: false },
  { id: '玖熙', realName: '敖语思涵', team: '南通Hero久竞', status: '现役', role: '中路', era: '2025—26', champion: false, fmvp: false },
  { id: '妖刀', realName: '钟乐天', team: '南通Hero久竞', status: '现役', role: '发育路', era: '2019—21', champion: true, fmvp: false },
  { id: '白清', realName: '吴轲蔚', team: '南通Hero久竞', status: '现役', role: '游走', era: '2025—26', champion: false, fmvp: false },

  { id: '小落', realName: '王科', team: '杭州LGD.NBW', status: '现役', role: '对抗路', era: '2022—24', champion: false, fmvp: false },
  { id: '米苏', realName: '姜腾瑞', team: '杭州LGD.NBW', status: '现役', role: '打野', era: '2025—26', champion: false, fmvp: false },
  { id: '九尾', realName: '许鑫蓁', team: '杭州LGD.NBW', status: '现役', role: '中路', era: '2019—21', champion: false, fmvp: false, aliases: ['许鑫蓁'] },
  { id: '小涵', realName: '钟志涵', team: '杭州LGD.NBW', status: '现役', role: '发育路', era: '2022—24', champion: false, fmvp: false },
  { id: '小崽', realName: '夏肇汛', team: '杭州LGD.NBW', status: '现役', role: '游走', era: '2022—24', champion: false, fmvp: false },
  { id: '冰尘', realName: '李小龙', team: '杭州LGD.NBW', status: '替补', role: '游走', era: '2019—21', champion: true, fmvp: false },

  { id: '梦岚', realName: '彭俊岚', team: '佛山DRG', status: '现役', role: '发育路', era: '2019—21', champion: false, fmvp: false },
  { id: '花缘', realName: '谭锦威', team: '佛山DRG', status: '现役', role: '对抗路', era: '2025—26', champion: false, fmvp: false },
  { id: '小小阳', realName: '应恒阳', team: '佛山DRG', status: '现役', role: '打野', era: '2025—26', champion: false, fmvp: false },
  { id: '小泽', realName: '沈宇泽', team: '上海EDG.M', status: '现役', role: '对抗路', era: '2019—21', champion: false, fmvp: false },
  { id: '花卷', realName: '吴育涛', team: '上海EDG.M', status: '现役', role: '中路', era: '2019—21', champion: true, fmvp: false },
  { id: '鸣鸣', realName: '张恒鸣', team: '上海EDG.M', status: '现役', role: '发育路', era: '2022—24', champion: false, fmvp: false },
  { id: '今屿', realName: '徐翔宇', team: '济南RW侠', status: '现役', role: '打野', era: '2019—21', champion: true, fmvp: false },
  { id: '初晨', realName: '陶传凯', team: '济南RW侠', status: '替补', role: '打野', era: '2016—18', champion: false, fmvp: false },
  { id: '挽墨', realName: '骆雪岩', team: '济南RW侠', status: '现役', role: '中路', era: '2022—24', champion: false, fmvp: false },
  { id: '帆帆', realName: '杨帆', team: '长沙TES.A', status: '现役', role: '游走', era: '2019—21', champion: true, fmvp: false },
  { id: '蓝桉', realName: '李涿阳', team: '长沙TES.A', status: '现役', role: '发育路', era: '2022—24', champion: false, fmvp: false },
  { id: '阿豆', realName: '蒋涛', team: '广州TTG', status: '替补', role: '游走', era: '2019—21', champion: false, fmvp: false },
  { id: '小雪', realName: '岳彩营', team: '广州TTG', status: '青训', role: '发育路', era: '2025—26', champion: false, fmvp: false },
  { id: '极光', realName: '周文强', team: '上海RNG.M', status: '现役', role: '发育路', era: '2022—24', champion: false, fmvp: false },
  { id: '久酷', realName: '王滔', team: '上海RNG.M', status: '现役', role: '游走', era: '2019—21', champion: true, fmvp: false },
  { id: '忆安', realName: '杜国豪', team: '西安WE', status: '替补', role: '游走', era: '2022—24', champion: false, fmvp: false },
  { id: '明崽', realName: '戴家权', team: '西安WE', status: '青训', role: '中路', era: '2025—26', champion: false, fmvp: false },

  { id: '梦泪', realName: '肖闽辉', team: '成都AG超玩会', status: '退役', role: '打野', era: '2016—18', champion: false, fmvp: false, aliases: ['肖闽辉'] },
  { id: '老帅', realName: '张宇辰', team: '成都AG超玩会', status: '退役', role: '中路', era: '2016—18', champion: true, fmvp: true },
  { id: 'Cat', realName: '陈正正', team: '武汉eStarPro', status: '退役', role: '游走', era: '2016—18', champion: true, fmvp: true, aliases: ['猫神'] },
  { id: '刺痛', realName: '夏圣钦', team: '重庆狼队', status: '退役', role: '发育路', era: '2016—18', champion: true, fmvp: false },
  { id: 'Alan', realName: '王添龙', team: '武汉eStarPro', status: '退役', role: '对抗路', era: '2016—18', champion: true, fmvp: false },
  { id: '诺言', realName: '郭桂鑫', team: '武汉eStarPro', status: '退役', role: '对抗路', era: '2016—18', champion: true, fmvp: false },
  { id: '久诚', realName: '曹志顺', team: '深圳DYG', status: '退役', role: '中路', era: '2016—18', champion: true, fmvp: true },
  { id: '虔诚', realName: '刘学煌', team: '上海RNG.M', status: '退役', role: '发育路', era: '2016—18', champion: false, fmvp: false },
  { id: '暴风锐', realName: '刘伟杰', team: '上海RNG.M', status: '退役', role: '中路', era: '2016—18', champion: false, fmvp: false },
  { id: '无痕', realName: '祝昊运', team: '上海EDG.M', status: '退役', role: '对抗路', era: '2016—18', champion: true, fmvp: false },
  { id: '辰鬼', realName: '李承乾', team: '重庆狼队', status: '退役', role: '游走', era: '2016—18', champion: true, fmvp: true },
  { id: '渡劫', realName: '彭志', team: '济南RW侠', status: '退役', role: '对抗路', era: '2016—18', champion: false, fmvp: false },
  { id: '潇洒', realName: '李潮', team: 'sViper', status: '退役', role: '对抗路', era: '2016—18', champion: false, fmvp: false, aliases: ['解说潇洒'] },
  { id: '老王', realName: '王华斌', team: 'JC', status: '退役', role: '游走', era: '2016—18', champion: false, fmvp: false },
  { id: '拖米', realName: '范天逸', team: 'DL火箭', status: '退役', role: '中路', era: '2016—18', champion: false, fmvp: false },
  { id: '黄超', realName: '黄超', team: 'GK', status: '退役', role: '打野', era: '2016—18', champion: false, fmvp: false, aliases: ['黄大仙'] },
  { id: '路西法', realName: '傅子昂', team: '苏州KSG', status: '退役', role: '对抗路', era: '2016—18', champion: false, fmvp: false, aliases: ['西法', 'Lucifer'] },
  { id: '雨雨', realName: '俞超杰', team: '上海RNG.M', status: '退役', role: '对抗路', era: '2016—18', champion: false, fmvp: false },
  { id: '居居', realName: '郭嘉辉', team: 'BA黑凤梨', status: '退役', role: '中路', era: '2016—18', champion: false, fmvp: false },
  { id: '尘夏', realName: '王庆', team: '南京Hero久竞', status: '退役', role: '打野', era: '2016—18', champion: true, fmvp: false },
  { id: '花海', realName: '罗思源', team: '武汉eStarPro', status: '退役', role: '打野', era: '2019—21', champion: true, fmvp: true, aliases: ['海队'] },
  { id: '晨羽', realName: '高星宇', team: '广州TTG', status: '退役', role: '对抗路', era: '2019—21', champion: false, fmvp: false },
  { id: '花云', realName: '张凯峰', team: '济南RW侠', status: '退役', role: '发育路', era: '2019—21', champion: false, fmvp: false },
  { id: '北岛', realName: '王东', team: 'MTG', status: '退役', role: '发育路', era: '2016—18', champion: true, fmvp: false },
  { id: '安七', realName: '戴子强', team: '长沙TES.A', status: '退役', role: '打野', era: '2025—26', champion: false, fmvp: false },
  { id: '不然', realName: '叶康', team: '长沙TES.A', status: '退役', role: '打野', era: '2019—21', champion: true, fmvp: true, aliases: ['驯龙高手'] },
];

const players: Player[] = [
  ...(latestPlayers as Player[]),
  ...legacyPlayers.filter((player) => player.status === '退役'),
];

const modes: { id: Mode; label: string; short: string; description: string }[] = [
  { id: 'all', label: '全体模式', short: '全体', description: '现役、替补、青训与退役名将' },
  { id: 'active', label: '现役模式', short: '现役', description: '当前一线大名单主力选手' },
  { id: 'reserve', label: '替补模式', short: '替补', description: '轮换与替补席选手' },
  { id: 'academy', label: '青训模式', short: '青训', description: '注册名单中尚无 KPL 登场记录的新秀' },
  { id: 'legend', label: '退役传奇', short: '传奇', description: 'KPL 记忆中的经典选手' },
];

const eraOrder: Era[] = ['2016—18', '2019—21', '2022—24', '2025—26'];
const statusOrder: PlayerStatus[] = ['退役', '替补', '青训', '现役'];

function modePlayers(mode: Mode) {
  if (mode === 'all') return players;
  if (mode === 'active') return players.filter((player) => player.status === '现役');
  if (mode === 'reserve') return players.filter((player) => player.status === '替补');
  if (mode === 'academy') return players.filter((player) => player.status === '青训');
  return players.filter((player) => player.status === '退役');
}

function exactOrMiss<T>(guess: T, answer: T): Comparison {
  return { state: guess === answer ? 'exact' : 'miss' };
}

function orderedCompare<T>(guess: T, answer: T, order: T[], closeDistance = 1): Comparison {
  if (guess === answer) return { state: 'exact' };
  const guessIndex = order.indexOf(guess);
  const answerIndex = order.indexOf(answer);
  return {
    state: Math.abs(guessIndex - answerIndex) <= closeDistance ? 'close' : 'miss',
    direction: answerIndex > guessIndex ? 'up' : 'down',
  };
}

function comparePlayers(guess: Player, answer: Player): GuessRow {
  return {
    player: guess,
    comparison: {
      team: exactOrMiss(guess.team, answer.team),
      status: orderedCompare(guess.status, answer.status, statusOrder),
      role: exactOrMiss(guess.role, answer.role),
      era: orderedCompare(guess.era, answer.era, eraOrder),
      champion: exactOrMiss(guess.champion, answer.champion),
      fmvp: exactOrMiss(guess.fmvp, answer.fmvp),
    },
  };
}

function matchesSearch(player: Player, query: string) {
  const normalized = query.trim().toLocaleLowerCase('zh-CN');
  if (!normalized) return false;
  return [player.id, player.realName, player.team, ...(player.aliases ?? [])]
    .join(' ')
    .toLocaleLowerCase('zh-CN')
    .includes(normalized);
}

function randomFrom<T>(items: T[], previous?: T) {
  if (items.length <= 1) return items[0];
  let next = items[Math.floor(Math.random() * items.length)];
  while (next === previous) next = items[Math.floor(Math.random() * items.length)];
  return next;
}

function initials(value: string) {
  return value.replace(/[^a-zA-Z\u4e00-\u9fff]/g, '').slice(0, 2).toUpperCase();
}

function Direction({ value }: { value?: 'up' | 'down' }) {
  if (value === 'up') return <ArrowUp aria-label="答案资历或状态更高" className="direction-icon" />;
  if (value === 'down') return <ArrowDown aria-label="答案资历或状态更低" className="direction-icon" />;
  return null;
}

function ResultCell({ comparison, children }: { comparison: Comparison; children: React.ReactNode }) {
  return (
    <div className={`result-cell is-${comparison.state}`}>
      <span>{children}</span>
      <Direction value={comparison.direction} />
    </div>
  );
}

export default function Home() {
  const [mode, setMode] = useState<Mode>('all');
  const [answer, setAnswer] = useState<Player>(players[0]);
  const [query, setQuery] = useState('');
  const [guesses, setGuesses] = useState<GuessRow[]>([]);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [maxGuesses, setMaxGuesses] = useState(8);
  const [rewardUsed, setRewardUsed] = useState(false);
  const [rewardMessage, setRewardMessage] = useState('');
  const [rulesOpen, setRulesOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  const [stats, setStats] = useState({ played: 0, wins: 0, streak: 0, best: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  const pool = useMemo(() => modePlayers(mode), [mode]);
  const guessedIds = useMemo(() => new Set(guesses.map((guess) => guess.player.id)), [guesses]);
  const suggestions = useMemo(
    () => pool.filter((player) => !guessedIds.has(player.id) && matchesSearch(player, query)).slice(0, 7),
    [pool, query, guessedIds],
  );
  const currentMode = modes.find((item) => item.id === mode) ?? modes[0];
  const remaining = Math.max(0, maxGuesses - guesses.length);
  const winRate = stats.played ? Math.round((stats.wins / stats.played) * 100) : 0;

  useEffect(() => {
    setAnswer(randomFrom(modePlayers('all')));
    try {
      const saved = localStorage.getItem('kpl-who-stats');
      if (saved) setStats(JSON.parse(saved));
    } catch {
      // Local statistics are optional.
    }
  }, []);

  function persistStats(next: typeof stats) {
    setStats(next);
    try {
      localStorage.setItem('kpl-who-stats', JSON.stringify(next));
    } catch {
      // Local statistics are optional.
    }
  }

  function startRound(nextMode: Mode = mode) {
    const nextPool = modePlayers(nextMode);
    setAnswer((previous) => randomFrom(nextPool, previous));
    setGuesses([]);
    setQuery('');
    setStatus('playing');
    setMaxGuesses(8);
    setRewardUsed(false);
    setRewardMessage('');
    window.setTimeout(() => inputRef.current?.focus(), 80);
  }

  function chooseMode(nextMode: Mode) {
    setMode(nextMode);
    setModeOpen(false);
    startRound(nextMode);
  }

  function finishRound(won: boolean, guessCount: number) {
    const next = {
      played: stats.played + 1,
      wins: stats.wins + (won ? 1 : 0),
      streak: won ? stats.streak + 1 : 0,
      best: won ? Math.max(stats.best, stats.streak + 1) : stats.best,
    };
    persistStats(next);
    setStatus(won ? 'won' : 'lost');
    if (!won && guessCount < maxGuesses) setStatus('playing');
  }

  function submitGuess(player: Player) {
    if (status !== 'playing' || guessedIds.has(player.id)) return;
    const row = comparePlayers(player, answer);
    const nextGuesses = [row, ...guesses];
    const won = player.id === answer.id;
    let nextMax = maxGuesses;

    if (!won && !rewardUsed) {
      const clone = Object.values(row.comparison).every((item) => item.state === 'exact');
      const sameTeam = row.comparison.team.state === 'exact';
      if (clone || sameTeam) {
        nextMax += 1;
        setMaxGuesses(nextMax);
        setRewardUsed(true);
        setRewardMessage(clone ? '命中“复制人”，额外获得 1 次机会' : '猜中同战队，额外获得 1 次机会');
        window.setTimeout(() => setRewardMessage(''), 3200);
      }
    }

    setGuesses(nextGuesses);
    setQuery('');

    if (won) finishRound(true, nextGuesses.length);
    else if (nextGuesses.length >= nextMax) finishRound(false, nextGuesses.length);
    else window.setTimeout(() => inputRef.current?.focus(), 80);
  }

  function submitFromInput() {
    if (!query.trim()) return;
    const exact = pool.find(
      (player) =>
        !guessedIds.has(player.id) &&
        [player.id, player.realName, ...(player.aliases ?? [])].some(
          (name) => name.toLocaleLowerCase('zh-CN') === query.trim().toLocaleLowerCase('zh-CN'),
        ),
    );
    if (exact) submitGuess(exact);
    else if (suggestions.length === 1) submitGuess(suggestions[0]);
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <a className="brand" href="#top" aria-label="KPL 猜猜看首页">
          <span className="brand-mark"><Swords /></span>
          <span>
            <strong>KPL 猜猜看</strong>
            <small>WHO IS THE PLAYER</small>
          </span>
        </a>
        <nav className="top-actions" aria-label="辅助功能">
          <button className="text-button" type="button" onClick={() => setRulesOpen(true)}>
            <BookOpen /> 游戏规则
          </button>
          <span className="season-pill"><span /> 2026 夏季赛</span>
        </nav>
      </header>

      <section className="page-intro" id="top">
        <div>
          <Badge className="eyebrow"><Flame /> KPL PLAYER GUESS</Badge>
          <h1>八次机会，锁定这位<span>职业选手</span></h1>
          <p>每次猜测都会揭开一组线索。看战队、分路与生涯标签，找到今天藏在聚光灯下的人。</p>
        </div>
        <div className="intro-stats" aria-label="本地战绩">
          <div><strong>{stats.played}</strong><span>已玩</span></div>
          <div><strong>{winRate}%</strong><span>胜率</span></div>
          <div><strong>{stats.streak}</strong><span>连胜</span></div>
        </div>
      </section>

      <section className="game-layout">
        <div className="game-card">
          <div className="game-card-head">
            <div className="mode-picker-wrap">
              <button className="mode-picker" type="button" onClick={() => setModeOpen((open) => !open)} aria-expanded={modeOpen}>
                <span className="mode-icon"><Shield /></span>
                <span><small>当前题库</small><strong>{currentMode.label}</strong></span>
                <ChevronDown className={modeOpen ? 'rotate' : ''} />
              </button>
              {modeOpen && (
                <div className="mode-menu">
                  {modes.map((item) => (
                    <button key={item.id} type="button" className={item.id === mode ? 'selected' : ''} onClick={() => chooseMode(item.id)}>
                      <span>{item.label}<small>{item.description}</small></span>
                      {item.id === mode && <Check />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="tries-block">
              <span>剩余机会</span>
              <strong>{remaining}<small> / {maxGuesses}</small></strong>
              <div className="tries-dots" aria-label={`剩余 ${remaining} 次机会`}>
                {Array.from({ length: maxGuesses }).map((_, index) => (
                  <i key={index} className={index < remaining ? 'active' : ''} />
                ))}
              </div>
            </div>
          </div>

          <div className="search-zone">
            <div className="search-title">
              <span>输入选手 ID 或姓名</span>
              <small>本题库共 {pool.length} 名选手</small>
            </div>
            <div className="search-row">
              <div className="search-box">
                <Search />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && submitFromInput()}
                  disabled={status !== 'playing'}
                  placeholder="例如：一诺、Fly、徐必成…"
                  aria-label="搜索并选择 KPL 选手"
                  autoComplete="off"
                />
                {query && <button type="button" onClick={() => setQuery('')} aria-label="清空搜索"><X /></button>}
                {query && status === 'playing' && (
                  <div className="suggestions">
                    {suggestions.length ? suggestions.map((player) => (
                      <button type="button" key={player.id} onClick={() => submitGuess(player)}>
                        <span className="mini-avatar">{initials(player.id)}</span>
                        <span><strong>{player.id}</strong><small>{player.realName} · {player.team}</small></span>
                        <Badge variant="outline">{player.role}</Badge>
                      </button>
                    )) : <div className="no-result">当前题库未找到这名选手</div>}
                  </div>
                )}
              </div>
              <Button size="lg" onClick={submitFromInput} disabled={status !== 'playing' || !query.trim()}>
                提交猜测 <ArrowRight />
              </Button>
            </div>
            <div className="legend-row">
              <span><i className="legend-dot exact" />完全一致</span>
              <span><i className="legend-dot close" />接近或相邻</span>
              <span><i className="legend-dot miss" />不匹配</span>
              <span><ArrowUp /> <ArrowDown />答案方向</span>
            </div>
          </div>

          {rewardMessage && <div className="reward-toast"><Sparkles /> {rewardMessage}</div>}

          {status !== 'playing' && (
            <div className={`settlement is-${status}`}>
              <div className="settlement-icon">{status === 'won' ? <Trophy /> : <CircleHelp />}</div>
              <div>
                <small>{status === 'won' ? `第 ${guesses.length} 次猜中` : '机会已经用完'}</small>
                <h2>{status === 'won' ? '漂亮！你锁定了答案' : '答案揭晓'}</h2>
                <p>本局选手是 <strong>{answer.team}.{answer.id}</strong>（{answer.realName}）</p>
              </div>
              <Button onClick={() => startRound()}><RotateCcw /> 再来一局</Button>
            </div>
          )}

          <div className="results-wrap">
            <div className="results-table" role="table" aria-label="猜测结果">
              <div className="result-header" role="row">
                <span>选手</span><span>战队</span><span>身份</span><span>分路</span><span>初登时期</span><span>冠军</span><span>FMVP</span>
              </div>
              {guesses.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-emblem"><Gamepad2 /></span>
                  <h3>第一条线索等你揭开</h3>
                  <p>输入任意选手开始。即使猜错，也会得到六项对比信息。</p>
                </div>
              ) : guesses.map((guess, rowIndex) => (
                <div className="result-row" role="row" key={guess.player.id} style={{ animationDelay: `${rowIndex * 40}ms` }}>
                  <div className={`player-cell ${guess.player.id === answer.id ? 'is-answer' : ''}`}>
                    <span className="player-avatar">{initials(guess.player.id)}</span>
                    <span><strong>{guess.player.id}</strong><small>{guess.player.realName}</small></span>
                  </div>
                  <ResultCell comparison={guess.comparison.team}>{guess.player.team.replace(/成都|重庆|武汉|北京|深圳|南通|杭州|佛山|上海|济南|长沙|广州|西安/g, '')}</ResultCell>
                  <ResultCell comparison={guess.comparison.status}>{guess.player.status}</ResultCell>
                  <ResultCell comparison={guess.comparison.role}>{guess.player.role}</ResultCell>
                  <ResultCell comparison={guess.comparison.era}>{guess.player.era}</ResultCell>
                  <ResultCell comparison={guess.comparison.champion}>{guess.player.champion ? '有' : '无'}</ResultCell>
                  <ResultCell comparison={guess.comparison.fmvp}>{guess.player.fmvp ? '有' : '无'}</ResultCell>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="side-panel">
          <div className="side-card spotlight-card">
            <span className="side-kicker"><Sparkles /> MODE SPOTLIGHT</span>
            <h3>{currentMode.label}</h3>
            <p>{currentMode.description}，输入选手 ID 或姓名即可开始。</p>
            <div className="pool-breakdown">
              {(['现役', '替补', '青训', '退役'] as PlayerStatus[]).map((item) => (
                <span key={item}>{item}<strong>{pool.filter((player) => player.status === item).length}</strong></span>
              ))}
            </div>
          </div>
          <div className="side-card tip-card">
            <span className="side-kicker"><CircleHelp /> 推理提示</span>
            <h3>先锁定分路，再看战队</h3>
            <p>“初登时期”相邻会显示金色，箭头指向答案更早或更晚的生涯阶段。</p>
            <button type="button" onClick={() => setRulesOpen(true)}>查看完整规则 <ArrowRight /></button>
          </div>
          <div className="side-card mini-record">
            <span className="side-kicker"><Trophy /> 你的纪录</span>
            <div><span>最佳连胜</span><strong>{stats.best}</strong></div>
            <div><span>当前连胜</span><strong>{stats.streak}</strong></div>
          </div>
        </aside>
      </section>

      <footer>
        <span>KPL 猜猜看 · 玩家自制非官方游戏</span>
        <span>校准至 2026-09-02 · 阵容：2026 KPL 夏季赛注册名单 · 退役：联盟致敬名单及俱乐部官宣 · 荣誉：官方赛事记录</span>
      </footer>

      {rulesOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setRulesOpen(false)}>
          <section className="rules-modal" role="dialog" aria-modal="true" aria-labelledby="rules-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setRulesOpen(false)} aria-label="关闭规则"><X /></button>
            <Badge className="eyebrow"><BookOpen /> HOW TO PLAY</Badge>
            <h2 id="rules-title">游戏规则</h2>
            <p className="rules-lead">你有 8 次机会猜出隐藏的 KPL 职业选手。每次提交后，系统会逐项比较两位选手的资料。</p>
            <div className="rule-grid">
              <div><i className="rule-swatch exact" /><strong>绿色 · 完全一致</strong><p>这一项与隐藏答案相同。</p></div>
              <div><i className="rule-swatch close" /><strong>金色 · 接近</strong><p>身份或初登时期彼此相邻。</p></div>
              <div><i className="rule-swatch miss" /><strong>灰色 · 不匹配</strong><p>继续利用其他线索缩小范围。</p></div>
              <div><i className="rule-swatch arrow"><ArrowUp /></i><strong>箭头 · 答案方向</strong><p>答案的身份层级或初登时期更高/更晚。</p></div>
            </div>
            <div className="bonus-rule">
              <Sparkles />
              <div><strong>额外机会</strong><p>第一次猜中同战队，或除选手外全部栏目一致，可额外获得 1 次机会；每局最多奖励一次。</p></div>
            </div>
            <p className="rules-lead">数据说明：“青训”是游戏内分类，指夏季赛注册名单中尚无 KPL 登场记录的新秀，并不等同于俱乐部官方青训编制。</p>
            <Button size="lg" onClick={() => setRulesOpen(false)}>开始挑战 <Swords /></Button>
          </section>
        </div>
      )}
    </main>
  );
}
