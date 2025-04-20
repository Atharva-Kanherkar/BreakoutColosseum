"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTournamentStatistics = exports.removeParticipant = exports.approveParticipant = exports.updateParticipantSeed = exports.getTournamentAnnouncements = exports.createAnnouncement = exports.getTournamentResults = exports.getTournamentRoundMatches = exports.getTournamentMatches = exports.removeTeamMember = exports.addTeamMember = exports.updateTeam = exports.createTeam = exports.generateTournamentBracket = exports.getUserSpectatedTournaments = exports.getUserParticipatingTournaments = exports.getUserHostedTournaments = exports.getTournamentTeams = exports.getTournamentParticipants = exports.removeSpectator = exports.addSpectator = exports.unregisterParticipant = exports.registerParticipant = exports.updateTournamentStatus = exports.deleteTournament = exports.updateTournament = exports.getTournamentById = exports.getTournaments = exports.createTournament = void 0;
const db_1 = __importDefault(require("../../lib/db"));
const types_1 = require("./types");
const prizeService = __importStar(require("../prize/service"));
// Helper function to map Prisma result to TournamentWithDetails
function mapToTournamentWithDetails(tournament) {
    return Object.assign(Object.assign({}, tournament), { host: tournament.host, _count: tournament._count });
}
const createTournament = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Check if user exists
    const user = yield db_1.default.user.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw new Error('User not found');
    }
    // Set default values
    const tournamentData = {
        name: data.name,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        hostId: userId,
        status: data.status || 'DRAFT',
        format: data.format || 'SINGLE_ELIMINATION',
        maxParticipants: data.maxParticipants || null,
        minParticipants: data.minParticipants || null,
        teamSize: data.teamSize || null,
        isTeamBased: (_a = data.isTeamBased) !== null && _a !== void 0 ? _a : false,
        registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : null
    };
    // Create tournament
    const tournament = yield db_1.default.tournament.create({
        data: tournamentData,
        include: {
            host: {
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            },
            _count: {
                select: {
                    participants: true,
                    teams: true,
                    spectators: true
                }
            }
        }
    });
    return mapToTournamentWithDetails(tournament);
});
exports.createTournament = createTournament;
const getTournaments = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 10, search, status) {
    const skip = (page - 1) * limit;
    // Build where clause for filtering
    let whereClause = {};
    if (search) {
        whereClause = {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ]
        };
    }
    if (status) {
        whereClause.status = status;
    }
    const [tournaments, totalCount] = yield Promise.all([
        db_1.default.tournament.findMany({
            where: whereClause,
            include: {
                host: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                },
                _count: {
                    select: {
                        participants: true,
                        teams: true,
                        spectators: true
                    }
                }
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        }),
        db_1.default.tournament.count({ where: whereClause })
    ]);
    return {
        items: tournaments.map(mapToTournamentWithDetails),
        pagination: {
            total: totalCount,
            page,
            limit,
            pages: Math.ceil(totalCount / limit)
        }
    };
});
exports.getTournaments = getTournaments;
const getTournamentById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const tournament = yield db_1.default.tournament.findUnique({
        where: { id },
        include: {
            host: {
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            },
            _count: {
                select: {
                    participants: true,
                    teams: true,
                    spectators: true
                }
            }
        }
    });
    return tournament ? mapToTournamentWithDetails(tournament) : null;
});
exports.getTournamentById = getTournamentById;
const updateTournament = (id, userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if tournament exists and user is host
    const tournament = yield db_1.default.tournament.findFirst({
        where: {
            id,
            hostId: userId
        }
    });
    if (!tournament) {
        throw new Error('Tournament not found or you are not the host');
    }
    // Handle date conversions
    const updateData = Object.assign(Object.assign({}, data), { startDate: data.startDate !== undefined
            ? (data.startDate ? new Date(data.startDate) : null)
            : undefined, endDate: data.endDate !== undefined
            ? (data.endDate ? new Date(data.endDate) : null)
            : undefined, registrationDeadline: data.registrationDeadline !== undefined
            ? (data.registrationDeadline ? new Date(data.registrationDeadline) : null)
            : undefined });
    // Update tournament
    const updatedTournament = yield db_1.default.tournament.update({
        where: { id },
        data: updateData,
        include: {
            host: {
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            },
            _count: {
                select: {
                    participants: true,
                    teams: true,
                    spectators: true
                }
            }
        }
    });
    return mapToTournamentWithDetails(updatedTournament);
});
exports.updateTournament = updateTournament;
const deleteTournament = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if tournament exists and user is host
    const tournament = yield db_1.default.tournament.findFirst({
        where: {
            id,
            hostId: userId
        }
    });
    if (!tournament) {
        throw new Error('Tournament not found or you are not the host');
    }
    // Check if tournament is in progress or completed (might want to prevent deletion)
    if (tournament.status === 'ONGOING' || tournament.status === 'COMPLETED') {
        throw new Error('Cannot delete a tournament that is in progress or completed');
    }
    // Delete tournament - this will cascade to participants, etc. based on your database setup
    yield db_1.default.tournament.delete({
        where: { id }
    });
});
exports.deleteTournament = deleteTournament;
const updateTournamentStatus = (id, userId, status) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if tournament exists and user is host
    const tournament = yield db_1.default.tournament.findFirst({
        where: {
            id,
            hostId: userId
        },
        include: {
            _count: {
                select: {
                    participants: true
                }
            }
        }
    });
    if (!tournament) {
        throw new Error('Tournament not found or you are not the host');
    }
    // Validate status transitions
    switch (status) {
        case 'REGISTRATION_OPEN':
            // Can only open registration from draft
            if (tournament.status !== 'DRAFT' && tournament.status !== 'REGISTRATION_CLOSED') {
                throw new Error('Can only open registration from draft or closed registration state');
            }
            break;
        case 'REGISTRATION_CLOSED':
            // Can only close from open registration
            if (tournament.status !== 'REGISTRATION_OPEN') {
                throw new Error('Can only close registration from open registration state');
            }
            break;
        case 'ONGOING':
            // Check minimum participants
            if (tournament.minParticipants && tournament._count.participants < tournament.minParticipants) {
                throw new Error(`Not enough participants. Minimum required: ${tournament.minParticipants}`);
            }
            // Check status
            if (tournament.status !== 'REGISTRATION_CLOSED') {
                throw new Error('Tournament must have registration closed before starting');
            }
            break;
        case 'COMPLETED':
            // Can only complete from ongoing
            if (tournament.status !== 'ONGOING') {
                throw new Error('Can only complete tournaments that are ongoing');
            }
            break;
        case 'CANCELLED':
            // Can cancel from most states except completed
            if (tournament.status === 'COMPLETED') {
                throw new Error('Cannot cancel a completed tournament');
            }
            break;
    }
    // Update tournament status
    const updatedTournament = yield db_1.default.tournament.update({
        where: { id },
        data: { status },
        include: {
            host: {
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            },
            _count: {
                select: {
                    participants: true,
                    teams: true,
                    spectators: true
                }
            }
        }
    });
    return mapToTournamentWithDetails(updatedTournament);
});
exports.updateTournamentStatus = updateTournamentStatus;
const registerParticipant = (tournamentId, userId, entryFeeTx // Optional transaction signature
) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tournament = yield db_1.default.tournament.findUnique({
        where: { id: tournamentId },
        include: {
            prize: true, // Include prize info to check for entry fee
            participants: {
                select: { id: true }
            }
        }
    });
    if (!tournament) {
        throw new Error('Tournament not found');
    }
    if (tournament.status !== types_1.TournamentStatus.REGISTRATION_OPEN) {
        throw new Error('Tournament registration is not open');
    }
    if (tournament.maxParticipants && tournament.participants.length >= tournament.maxParticipants) {
        throw new Error('Tournament has reached maximum participants');
    }
    // Check if user is already registered
    const existingParticipant = yield db_1.default.tournamentParticipant.findFirst({
        where: {
            userId,
            tournamentId
        }
    });
    if (existingParticipant) {
        throw new Error('You are already registered for this tournament');
    }
    // Check if entry fee is required
    let entryFeeVerified = false;
    if (((_a = tournament.prize) === null || _a === void 0 ? void 0 : _a.entryFee) && parseFloat(tournament.prize.entryFee) > 0) {
        if (!entryFeeTx) {
            throw new Error('Entry fee payment transaction is required for this tournament');
        }
        // Verify the transaction
        entryFeeVerified = yield prizeService.verifyEntryFeePayment(entryFeeTx, tournament.prize.entryFee, tournament.prize.tokenType || 'SOL', tournament.prize.tokenAddress || undefined);
        if (!entryFeeVerified) {
            throw new Error('Entry fee payment verification failed');
        }
    }
    else {
        // No entry fee required
        entryFeeVerified = true;
    }
    // Create participant record
    const participant = yield db_1.default.tournamentParticipant.create({
        data: {
            userId,
            tournamentId,
            entryFeeTx: entryFeeVerified ? entryFeeTx : null
        },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            }
        }
    });
    return participant;
});
exports.registerParticipant = registerParticipant;
const unregisterParticipant = (tournamentId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if tournament exists and is still in registration phase
    const tournament = yield db_1.default.tournament.findFirst({
        where: {
            id: tournamentId,
            OR: [
                { status: 'REGISTRATION_OPEN' },
                { status: 'REGISTRATION_CLOSED' }
            ]
        }
    });
    if (!tournament) {
        throw new Error('Tournament not found or registration phase has ended');
    }
    // Check if participant exists
    const participant = yield db_1.default.tournamentParticipant.findUnique({
        where: {
            userId_tournamentId: {
                userId,
                tournamentId
            }
        },
        include: {
            team: {
                include: {
                    captain: true
                }
            }
        }
    });
    if (!participant) {
        throw new Error('You are not registered for this tournament');
    }
    // If participant is a team captain, prevent unregistration
    if (participant.team && participant.team.captain.userId === userId) {
        throw new Error('Team captains cannot unregister. Transfer captaincy first or delete the team.');
    }
    // Delete the participation record
    yield db_1.default.tournamentParticipant.delete({
        where: {
            userId_tournamentId: {
                userId,
                tournamentId
            }
        }
    });
});
exports.unregisterParticipant = unregisterParticipant;
const addSpectator = (tournamentId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if tournament exists
    const tournament = yield db_1.default.tournament.findUnique({
        where: { id: tournamentId }
    });
    if (!tournament) {
        throw new Error('Tournament not found');
    }
    // Add spectator connection
    yield db_1.default.tournament.update({
        where: { id: tournamentId },
        data: {
            spectators: {
                connect: { id: userId }
            }
        }
    });
});
exports.addSpectator = addSpectator;
const removeSpectator = (tournamentId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if tournament exists
    const tournament = yield db_1.default.tournament.findUnique({
        where: { id: tournamentId }
    });
    if (!tournament) {
        throw new Error('Tournament not found');
    }
    // Remove spectator connection
    yield db_1.default.tournament.update({
        where: { id: tournamentId },
        data: {
            spectators: {
                disconnect: { id: userId }
            }
        }
    });
});
exports.removeSpectator = removeSpectator;
const getTournamentParticipants = (tournamentId_1, ...args_1) => __awaiter(void 0, [tournamentId_1, ...args_1], void 0, function* (tournamentId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    // Check if tournament exists
    const tournament = yield db_1.default.tournament.findUnique({
        where: { id: tournamentId }
    });
    if (!tournament) {
        throw new Error('Tournament not found');
    }
    const [participants, totalCount] = yield Promise.all([
        db_1.default.tournamentParticipant.findMany({
            where: { tournamentId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                },
                team: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        }),
        db_1.default.tournamentParticipant.count({ where: { tournamentId } })
    ]);
    return {
        items: participants,
        pagination: {
            total: totalCount,
            page,
            limit,
            pages: Math.ceil(totalCount / limit)
        }
    };
});
exports.getTournamentParticipants = getTournamentParticipants;
const getTournamentTeams = (tournamentId_1, ...args_1) => __awaiter(void 0, [tournamentId_1, ...args_1], void 0, function* (tournamentId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    // Check if tournament exists
    const tournament = yield db_1.default.tournament.findUnique({
        where: { id: tournamentId }
    });
    if (!tournament) {
        throw new Error('Tournament not found');
    }
    const [teams, totalCount] = yield Promise.all([
        db_1.default.team.findMany({
            where: { tournamentId },
            include: {
                captain: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        members: true
                    }
                }
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        }),
        db_1.default.team.count({ where: { tournamentId } })
    ]);
    return {
        items: teams,
        pagination: {
            total: totalCount,
            page,
            limit,
            pages: Math.ceil(totalCount / limit)
        }
    };
});
exports.getTournamentTeams = getTournamentTeams;
const getUserHostedTournaments = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [tournaments, totalCount] = yield Promise.all([
        db_1.default.tournament.findMany({
            where: { hostId: userId },
            include: {
                host: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                },
                _count: {
                    select: {
                        participants: true,
                        teams: true,
                        spectators: true
                    }
                }
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        }),
        db_1.default.tournament.count({ where: { hostId: userId } })
    ]);
    return {
        items: tournaments.map(mapToTournamentWithDetails),
        pagination: {
            total: totalCount,
            page,
            limit,
            pages: Math.ceil(totalCount / limit)
        }
    };
});
exports.getUserHostedTournaments = getUserHostedTournaments;
const getUserParticipatingTournaments = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [participations, totalCount] = yield Promise.all([
        db_1.default.tournamentParticipant.findMany({
            where: { userId },
            include: {
                tournament: {
                    include: {
                        host: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true
                            }
                        },
                        _count: {
                            select: {
                                participants: true,
                                teams: true
                            }
                        }
                    }
                },
                team: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        }),
        db_1.default.tournamentParticipant.count({ where: { userId } })
    ]);
    return {
        items: participations.map(p => (Object.assign(Object.assign({}, p.tournament), { team: p.team, joinedAt: p.createdAt }))),
        pagination: {
            total: totalCount,
            page,
            limit,
            pages: Math.ceil(totalCount / limit)
        }
    };
});
exports.getUserParticipatingTournaments = getUserParticipatingTournaments;
const getUserSpectatedTournaments = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    // Find user to get spectated tournaments
    const user = yield db_1.default.user.findUnique({
        where: { id: userId },
        include: {
            spectatedTournaments: {
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    host: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true
                        }
                    },
                    _count: {
                        select: {
                            participants: true,
                            teams: true,
                            spectators: true
                        }
                    }
                }
            },
            _count: {
                select: {
                    spectatedTournaments: true
                }
            }
        }
    });
    if (!user) {
        throw new Error('User not found');
    }
    return {
        items: user.spectatedTournaments.map(mapToTournamentWithDetails),
        pagination: {
            total: user._count.spectatedTournaments,
            page,
            limit,
            pages: Math.ceil(user._count.spectatedTournaments / limit)
        }
    };
});
exports.getUserSpectatedTournaments = getUserSpectatedTournaments;
/**
 * Generate tournament bracket
 */
const generateTournamentBracket = (tournamentId_1, userId_1, ...args_1) => __awaiter(void 0, [tournamentId_1, userId_1, ...args_1], void 0, function* (tournamentId, userId, seedMethod = 'random') {
    // Check if tournament exists and user is host
    const tournament = yield db_1.default.tournament.findFirst({
        where: {
            id: tournamentId,
            hostId: userId
        },
        include: {
            participants: true,
            teams: {
                include: {
                    members: true
                }
            }
        }
    });
    if (!tournament) {
        throw new Error('Tournament not found or you are not the host');
    }
    // Check if tournament is in the right state
    if (tournament.status !== 'REGISTRATION_CLOSED') {
        throw new Error('Tournament registration must be closed before generating brackets');
    }
    // Check if there are enough participants
    const participantCount = tournament.isTeamBased
        ? tournament.teams.length
        : tournament.participants.length;
    if (tournament.minParticipants && participantCount < tournament.minParticipants) {
        throw new Error(`Not enough participants. Minimum required: ${tournament.minParticipants}`);
    }
    // Check if brackets already exist
    const existingMatches = yield db_1.default.match.findFirst({
        where: { tournamentId }
    });
    if (existingMatches) {
        throw new Error('Tournament bracket has already been generated');
    }
    // Import from brackets utility
    const { generateInitialBracket } = yield Promise.resolve().then(() => __importStar(require('../../utils/brackets')));
    // Generate brackets based on tournament format
    const matches = yield generateInitialBracket(tournamentId);
    // Update tournament status to ONGOING
    yield db_1.default.tournament.update({
        where: { id: tournamentId },
        data: { status: 'ONGOING' }
    });
    return matches;
});
exports.generateTournamentBracket = generateTournamentBracket;
/**
 * Create a new team for a tournament
 */
/**
* Create a new team for a tournament
*/
const createTeam = (tournamentId, captainId, data) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if tournament exists and is open for registration
    const tournament = yield db_1.default.tournament.findFirst({
        where: {
            id: tournamentId,
            status: 'REGISTRATION_OPEN'
        }
    });
    if (!tournament) {
        throw new Error('Tournament not found or registration is not open');
    }
    // Check if the tournament is team-based
    if (!tournament.isTeamBased) {
        throw new Error('This tournament does not support teams');
    }
    // Check if user is already registered
    const existingParticipant = yield db_1.default.tournamentParticipant.findUnique({
        where: {
            userId_tournamentId: {
                userId: captainId,
                tournamentId
            }
        }
    });
    if (existingParticipant) {
        throw new Error('You are already registered for this tournament');
    }
    // Check max participants if set
    if (tournament.maxParticipants) {
        const teamCount = yield db_1.default.team.count({
            where: { tournamentId }
        });
        if (teamCount >= tournament.maxParticipants) {
            throw new Error('Tournament has reached maximum number of teams');
        }
    }
    // Execute in a transaction to ensure consistency
    return db_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Step 1: Create captain as participant first
        const captain = yield tx.tournamentParticipant.create({
            data: {
                userId: captainId,
                tournamentId,
                entryFeeTx: null,
            }
        });
        // Step 2: Create the team with the captain
        const team = yield tx.team.create({
            data: {
                name: data.name,
                description: data.description,
                logo: data.logo,
                tournamentId,
                captainId: captain.id
            }
        });
        // Step 3: Update the participant to be linked with the team
        const updatedCaptain = yield tx.tournamentParticipant.update({
            where: { id: captain.id },
            data: { teamId: team.id }
        });
        // Return the team with all relationships
        return tx.team.findUnique({
            where: { id: team.id },
            include: {
                captain: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true
                            }
                        }
                    }
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true
                            }
                        }
                    }
                }
            }
        });
    }));
}); /**
 * Update team details
 */
exports.createTeam = createTeam;
const updateTeam = (tournamentId, teamId, captainId, data) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if team exists and user is captain
    const team = yield db_1.default.team.findFirst({
        where: {
            id: teamId,
            tournamentId,
            captain: {
                userId: captainId
            }
        }
    });
    if (!team) {
        throw new Error('Team not found or you are not the captain');
    }
    // Update team
    const updatedTeam = yield db_1.default.team.update({
        where: { id: teamId },
        data,
        include: {
            captain: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true
                        }
                    }
                }
            },
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true
                        }
                    }
                }
            }
        }
    });
    return updatedTeam;
});
exports.updateTeam = updateTeam;
/**
 * Add member to team
 */
const addTeamMember = (tournamentId, teamId, captainId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if team exists and user is captain
    const team = yield db_1.default.team.findFirst({
        where: {
            id: teamId,
            tournamentId,
            captain: {
                userId: captainId,
                entryFeeTx: null,
            }
        },
        include: {
            _count: {
                select: { members: true }
            }
        }
    });
    if (!team) {
        throw new Error('Team not found or you are not the captain');
    }
    // Check if user is already in the team
    const existingMember = yield db_1.default.tournamentParticipant.findFirst({
        where: {
            userId,
            teamId,
            entryFeeTx: null,
        }
    });
    if (existingMember) {
        throw new Error('User is already a member of this team');
    }
    // Check if user is already participating in this tournament
    const existingParticipant = yield db_1.default.tournamentParticipant.findUnique({
        where: {
            userId_tournamentId: {
                userId,
                tournamentId
            }
        }
    });
    if (existingParticipant) {
        throw new Error('User is already participating in this tournament');
    }
    // Check team size limit
    const tournament = yield db_1.default.tournament.findUnique({
        where: { id: tournamentId }
    });
    if ((tournament === null || tournament === void 0 ? void 0 : tournament.teamSize) && team._count.members >= tournament.teamSize) {
        throw new Error(`Team has reached maximum size of ${tournament.teamSize} members`);
    }
    // Add member to team
    yield db_1.default.tournamentParticipant.create({
        data: {
            userId,
            tournamentId,
            teamId
        }
    });
    // Return updated team
    return db_1.default.team.findUnique({
        where: { id: teamId },
        include: {
            captain: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true
                        }
                    }
                }
            },
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true
                        }
                    }
                }
            }
        }
    });
});
exports.addTeamMember = addTeamMember;
/**
 * Remove member from team
 */
const removeTeamMember = (tournamentId, teamId, captainId, memberId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if team exists and user is captain
    const team = yield db_1.default.team.findFirst({
        where: {
            id: teamId,
            tournamentId,
            captain: {
                userId: captainId
            }
        }
    });
    if (!team) {
        throw new Error('Team not found or you are not the captain');
    }
    // Can't remove captain
    if (memberId === captainId) {
        throw new Error('Team captain cannot be removed');
    }
    // Check if member exists in team
    const member = yield db_1.default.tournamentParticipant.findFirst({
        where: {
            userId: memberId,
            teamId
        }
    });
    if (!member) {
        throw new Error('User is not a member of this team');
    }
    // Remove member from team
    yield db_1.default.tournamentParticipant.delete({
        where: {
            userId_tournamentId: {
                userId: memberId,
                tournamentId
            }
        }
    });
    // Return updated team
    return db_1.default.team.findUnique({
        where: { id: teamId },
        include: {
            captain: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true
                        }
                    }
                }
            },
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true
                        }
                    }
                }
            }
        }
    });
});
exports.removeTeamMember = removeTeamMember;
/**
 * Get all matches for a tournament
 */
const getTournamentMatches = (tournamentId_1, ...args_1) => __awaiter(void 0, [tournamentId_1, ...args_1], void 0, function* (tournamentId, page = 1, limit = 20, status, bracketSection) {
    const skip = (page - 1) * limit;
    // Build where clause
    let whereClause = { tournamentId };
    if (status) {
        whereClause.status = status;
    }
    if (bracketSection) {
        whereClause.bracketSection = bracketSection;
    }
    // Execute queries
    const [matches, totalCount] = yield Promise.all([
        db_1.default.match.findMany({
            where: whereClause,
            include: {
                teamA: true,
                teamB: true,
                participantA: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true
                            }
                        }
                    }
                },
                participantB: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true
                            }
                        }
                    }
                },
                judge: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                },
                tournament: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            skip,
            take: limit,
            orderBy: [
                { round: 'asc' },
                { matchNumber: 'asc' }
            ]
        }),
        db_1.default.match.count({ where: whereClause })
    ]);
    return {
        items: matches,
        pagination: {
            total: totalCount,
            page,
            limit,
            pages: Math.ceil(totalCount / limit)
        }
    };
});
exports.getTournamentMatches = getTournamentMatches;
/**
 * Get matches for a specific round in a tournament
 */
const getTournamentRoundMatches = (tournamentId, round) => __awaiter(void 0, void 0, void 0, function* () {
    const matches = yield db_1.default.match.findMany({
        where: {
            tournamentId,
            round
        },
        include: {
            teamA: true,
            teamB: true,
            participantA: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true
                        }
                    }
                }
            },
            participantB: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true
                        }
                    }
                }
            },
            judge: {
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            }
        },
        orderBy: { matchNumber: 'asc' }
    });
    return matches;
});
exports.getTournamentRoundMatches = getTournamentRoundMatches;
/**
 * Get tournament results/standings
 */
const getTournamentResults = (tournamentId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if tournament exists
    const tournament = yield db_1.default.tournament.findUnique({
        where: { id: tournamentId }
    });
    if (!tournament) {
        throw new Error('Tournament not found');
    }
    // Get all completed matches
    const matches = yield db_1.default.match.findMany({
        where: {
            tournamentId,
            status: 'COMPLETED'
        },
        include: {
            teamA: true,
            teamB: true,
            participantA: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true
                        }
                    }
                }
            },
            participantB: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true
                        }
                    }
                }
            }
        }
    });
    // For completed tournaments, get winner
    let winner = null;
    if (tournament.status === 'COMPLETED') {
        // Find final match
        const finalMatch = matches.find(match => {
            // Final match is typically the one with highest round number and no next match
            return !match.nextMatchId && match.status === 'COMPLETED';
        });
        if (finalMatch && finalMatch.result) {
            const result = finalMatch.result;
            // Determine winner entity
            if (finalMatch.teamAId && finalMatch.teamAId === result.winnerId) {
                winner = finalMatch.teamA;
            }
            else if (finalMatch.teamBId && finalMatch.teamBId === result.winnerId) {
                winner = finalMatch.teamB;
            }
            else if (finalMatch.participantAId && finalMatch.participantAId === result.winnerId) {
                winner = finalMatch.participantA;
            }
            else if (finalMatch.participantBId && finalMatch.participantBId === result.winnerId) {
                winner = finalMatch.participantB;
            }
        }
    }
    // Calculate standings
    const standings = calculateStandings(tournament, matches);
    return {
        tournamentId,
        tournamentName: tournament.name,
        status: tournament.status,
        winner,
        standings,
        completedMatches: matches.length
    };
});
exports.getTournamentResults = getTournamentResults;
/**
 * Calculate standings for tournament results
 */
function calculateStandings(tournament, matches) {
    // Create record of participant stats
    const statsByParticipant = {};
    // Process each match
    matches.forEach(match => {
        if (!match.result)
            return;
        const result = match.result;
        const winnerId = result.winnerId;
        // Track team A stats
        if (match.teamAId) {
            const team = match.teamA;
            if (!statsByParticipant[team.id]) {
                statsByParticipant[team.id] = {
                    id: team.id,
                    name: team.name,
                    isTeam: true,
                    avatar: team.logo,
                    wins: 0,
                    losses: 0,
                    score: 0
                };
            }
            if (team.id === winnerId) {
                statsByParticipant[team.id].wins += 1;
                statsByParticipant[team.id].score += 3; // 3 points for win
            }
            else {
                statsByParticipant[team.id].losses += 1;
            }
        }
        // Track team B stats
        if (match.teamBId) {
            const team = match.teamB;
            if (!statsByParticipant[team.id]) {
                statsByParticipant[team.id] = {
                    id: team.id,
                    name: team.name,
                    isTeam: true,
                    avatar: team.logo,
                    wins: 0,
                    losses: 0,
                    score: 0
                };
            }
            if (team.id === winnerId) {
                statsByParticipant[team.id].wins += 1;
                statsByParticipant[team.id].score += 3; // 3 points for win
            }
            else {
                statsByParticipant[team.id].losses += 1;
            }
        }
        // Track participant A stats
        if (match.participantAId) {
            const participant = match.participantA;
            const user = participant.user;
            if (!statsByParticipant[participant.id]) {
                statsByParticipant[participant.id] = {
                    id: participant.id,
                    name: user.username,
                    isTeam: false,
                    avatar: user.avatar,
                    wins: 0,
                    losses: 0,
                    score: 0
                };
            }
            if (participant.id === winnerId) {
                statsByParticipant[participant.id].wins += 1;
                statsByParticipant[participant.id].score += 3; // 3 points for win
            }
            else {
                statsByParticipant[participant.id].losses += 1;
            }
        }
        // Track participant B stats
        if (match.participantBId) {
            const participant = match.participantB;
            const user = participant.user;
            if (!statsByParticipant[participant.id]) {
                statsByParticipant[participant.id] = {
                    id: participant.id,
                    name: user.username,
                    isTeam: false,
                    avatar: user.avatar,
                    wins: 0,
                    losses: 0,
                    score: 0
                };
            }
            if (participant.id === winnerId) {
                statsByParticipant[participant.id].wins += 1;
                statsByParticipant[participant.id].score += 3; // 3 points for win
            }
            else {
                statsByParticipant[participant.id].losses += 1;
            }
        }
    });
    // Convert to array and sort by score (descending)
    return Object.values(statsByParticipant).sort((a, b) => {
        // Sort by score first
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        // If tied on score, sort by win ratio
        const aRatio = a.wins / (a.wins + a.losses) || 0;
        const bRatio = b.wins / (b.wins + b.losses) || 0;
        return bRatio - aRatio;
    });
}
/**
 * Create an announcement for a tournament
 */
const createAnnouncement = (tournamentId, userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if tournament exists and user is host
    const tournament = yield db_1.default.tournament.findFirst({
        where: {
            id: tournamentId,
            hostId: userId
        }
    });
    if (!tournament) {
        throw new Error('Tournament not found or you are not the host');
    }
    // Create announcement
    const announcement = yield db_1.default.tournamentAnnouncement.create({
        data: {
            title: data.title,
            content: data.content,
            importance: data.importance || 'medium',
            tournamentId,
            authorId: userId
        },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            }
        }
    });
    return announcement;
});
exports.createAnnouncement = createAnnouncement;
/**
 * Get announcements for a tournament
 */
const getTournamentAnnouncements = (tournamentId_1, ...args_1) => __awaiter(void 0, [tournamentId_1, ...args_1], void 0, function* (tournamentId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    // Check if tournament exists
    const tournament = yield db_1.default.tournament.findUnique({
        where: { id: tournamentId }
    });
    if (!tournament) {
        throw new Error('Tournament not found');
    }
    // Get announcements
    const [announcements, totalCount] = yield Promise.all([
        db_1.default.tournamentAnnouncement.findMany({
            where: { tournamentId },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                }
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        }),
        db_1.default.tournamentAnnouncement.count({ where: { tournamentId } })
    ]);
    return {
        items: announcements,
        pagination: {
            total: totalCount,
            page,
            limit,
            pages: Math.ceil(totalCount / limit)
        }
    };
});
exports.getTournamentAnnouncements = getTournamentAnnouncements;
/**
 * Update a participant's seed
 */
const updateParticipantSeed = (tournamentId, participantId, hostId, seed) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if tournament exists and user is host
    const tournament = yield db_1.default.tournament.findFirst({
        where: {
            id: tournamentId,
            hostId
        }
    });
    if (!tournament) {
        throw new Error('Tournament not found or you are not the host');
    }
    // Check if participant exists
    const participant = yield db_1.default.tournamentParticipant.findUnique({
        where: {
            id: participantId
        }
    });
    if (!participant || participant.tournamentId !== tournamentId) {
        throw new Error('Participant not found in this tournament');
    }
    // Update seed
    const updatedParticipant = yield db_1.default.tournamentParticipant.update({
        where: { id: participantId },
        data: { seed },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            },
            team: true
        }
    });
    return updatedParticipant;
});
exports.updateParticipantSeed = updateParticipantSeed;
/**
 * Approve a participant for a tournament
 */
const approveParticipant = (tournamentId, participantId, hostId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if tournament exists and user is host
    const tournament = yield db_1.default.tournament.findFirst({
        where: {
            id: tournamentId,
            hostId
        }
    });
    if (!tournament) {
        throw new Error('Tournament not found or you are not the host');
    }
    // Check if participant exists
    const participant = yield db_1.default.tournamentParticipant.findUnique({
        where: {
            id: participantId
        }
    });
    if (!participant || participant.tournamentId !== tournamentId) {
        throw new Error('Participant not found in this tournament');
    }
    // Update approval status
    const updatedParticipant = yield db_1.default.tournamentParticipant.update({
        where: { id: participantId },
        data: { isApproved: true },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            },
            team: true
        }
    });
    return updatedParticipant;
});
exports.approveParticipant = approveParticipant;
/**
 * Remove a participant from a tournament
 */
const removeParticipant = (tournamentId, participantId, hostId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if tournament exists and user is host
    const tournament = yield db_1.default.tournament.findFirst({
        where: {
            id: tournamentId,
            hostId
        }
    });
    if (!tournament) {
        throw new Error('Tournament not found or you are not the host');
    }
    // Check if participant exists
    const participant = yield db_1.default.tournamentParticipant.findUnique({
        where: {
            id: participantId
        }
    });
    if (!participant || participant.tournamentId !== tournamentId) {
        throw new Error('Participant not found in this tournament');
    }
    // If participant is a team captain, prevent removal
    if (participant.teamId) {
        const team = yield db_1.default.team.findFirst({
            where: {
                id: participant.teamId,
                captain: {
                    id: participantId
                }
            }
        });
        if (team) {
            throw new Error('Cannot remove team captain. Delete the team instead.');
        }
    }
    // Delete participant
    yield db_1.default.tournamentParticipant.delete({
        where: { id: participantId }
    });
});
exports.removeParticipant = removeParticipant;
/**
 * Get tournament statistics
 */
const getTournamentStatistics = (tournamentId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if tournament exists
    const tournament = yield db_1.default.tournament.findUnique({
        where: { id: tournamentId },
        include: {
            _count: {
                select: {
                    participants: true,
                    teams: true,
                    spectators: true
                }
            }
        }
    });
    if (!tournament) {
        throw new Error('Tournament not found');
    }
    // Get match statistics
    const matchStats = yield db_1.default.match.groupBy({
        by: ['status'],
        where: { tournamentId },
        _count: true
    });
    // Build match status counts
    const matchCounts = {
        PENDING: 0,
        IN_PROGRESS: 0,
        COMPLETED: 0,
        CANCELLED: 0,
        DISPUTED: 0
    };
    matchStats.forEach(stat => {
        matchCounts[stat.status] = stat._count;
    });
    // Total matches
    const totalMatches = Object.values(matchCounts).reduce((a, b) => a + b, 0);
    // Get average match duration
    const completedMatches = yield db_1.default.match.findMany({
        where: {
            tournamentId,
            status: 'COMPLETED',
            startTime: { not: null },
            endTime: { not: null }
        },
        select: {
            startTime: true,
            endTime: true
        }
    });
    let averageDurationMs = 0;
    if (completedMatches.length > 0) {
        const totalDurationMs = completedMatches.reduce((sum, match) => {
            const duration = match.endTime.getTime() - match.startTime.getTime();
            return sum + duration;
        }, 0);
        averageDurationMs = totalDurationMs / completedMatches.length;
    }
    // Calculate completion percentage
    const completionPercentage = totalMatches > 0
        ? (matchCounts.COMPLETED / totalMatches) * 100
        : 0;
    return {
        tournamentId,
        tournamentName: tournament.name,
        status: tournament.status,
        participantCount: tournament._count.participants,
        teamCount: tournament._count.teams,
        spectatorCount: tournament._count.spectators,
        matchStatistics: Object.assign(Object.assign({ total: totalMatches }, matchCounts), { averageDurationMinutes: Math.round(averageDurationMs / 60000), completionPercentage: Math.round(completionPercentage) }),
        startDate: tournament.startDate,
        endDate: tournament.endDate,
        duration: tournament.startDate && tournament.endDate
            ? Math.ceil((tournament.endDate.getTime() - tournament.startDate.getTime()) / (1000 * 3600 * 24))
            : null
    };
});
exports.getTournamentStatistics = getTournamentStatistics;
