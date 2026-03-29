import EntryLog from '../models/EntryLog.js';
import Student from '../models/Student.js';
import Visitor from '../models/Visitor.js';

// @desc    Get dashboard analytics and graph data
// @route   GET /api/dashboard/stats
// @access  Private (Admin/Security)
export const getDashboardStats = async (req, res) => {
    try {
        // 1. Core KPIs
        const totalVisitors = await Visitor.countDocuments();
        const pendingApprovals = await Visitor.countDocuments({ approval_status: 'Pending' });
        const totalStudents = await Student.countDocuments();

        // Active entries (people currently on campus)
        const activeEntries = await EntryLog.countDocuments({ exit_time: null });

        // 2. Graph Data: Students per College
        // Aggregate students grouped by the College ObjectId, and then populate the college name
        const studentsPerCollegeRaw = await Student.aggregate([
            {
                $group: {
                    _id: "$college",
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "colleges", // collection name in mongodb
                    localField: "_id",
                    foreignField: "_id",
                    as: "collegeDetails"
                }
            },
            {
                $unwind: "$collegeDetails"
            },
            {
                $project: {
                    name: "$collegeDetails.name",
                    value: "$count",
                    _id: 0
                }
            }
        ]);

        // 3. Graph Data: Recent Activity / Active Students (Entry logs from last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentEntriesRaw = await EntryLog.aggregate([
            {
                $match: {
                    entry_time: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$entry_time" }
                    },
                    studentEntries: {
                        $sum: { $cond: [{ $eq: ["$person_type", "Student"] }, 1, 0] }
                    },
                    visitorEntries: {
                        $sum: { $cond: [{ $eq: ["$person_type", "Visitor"] }, 1, 0] }
                    }
                }
            },
            {
                $sort: { _id: 1 } // Sort by date ascending
            },
            {
                $project: {
                    date: "$_id",
                    studentEntries: 1,
                    visitorEntries: 1,
                    _id: 0
                }
            }
        ]);

        res.json({
            kpis: {
                totalVisitors,
                pendingApprovals,
                totalStudents,
                activeEntries
            },
            charts: {
                studentsPerCollege: studentsPerCollegeRaw,
                recentEntries: recentEntriesRaw
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching dashboard stats' });
    }
};
